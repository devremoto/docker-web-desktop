$ErrorActionPreference = 'Stop'

$prefix = 'http://127.0.0.1:3334/'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Output "WSL host bridge started at $prefix"
Write-Output "Endpoints: /wsl/running, /wsl/docker-exec, /health"

function Read-RequestJson($request) {
    try {
        $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
        $raw = $reader.ReadToEnd()
        if ([string]::IsNullOrWhiteSpace($raw)) {
            return @{}
        }
        return ($raw | ConvertFrom-Json)
    }
    catch {
        return @{}
    }
}

function Write-JsonResponse($response, $statusCode, $payload) {
    $json = $payload | ConvertTo-Json -Compress -Depth 5
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.StatusCode = $statusCode
    $response.ContentType = 'application/json'
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Invoke-WslDockerCommand {
    param(
        [string]$DockerCommand,
        [string]$Distro
    )

    if ([string]::IsNullOrWhiteSpace($DockerCommand)) {
        return @{ success = $false; stdout = ''; stderr = 'Docker command is required'; exitCode = 1 }
    }

    $normalizedCommand = [regex]::Replace($DockerCommand, '^\s*docker\s+', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase).Trim()

    if ([string]::IsNullOrWhiteSpace($normalizedCommand)) {
        return @{ success = $false; stdout = ''; stderr = 'Docker command is required'; exitCode = 1 }
    }

    $normalizedDistro = if ([string]::IsNullOrWhiteSpace($Distro)) { '' } else { $Distro.Trim().ToLowerInvariant() }

    if ($normalizedDistro -eq 'docker-desktop' -or $normalizedDistro -eq 'docker-desktop-data') {
        $Distro = ''
    }

    $arguments = @()
    if (-not [string]::IsNullOrWhiteSpace($Distro)) {
        $arguments += @('-d', $Distro)
    }
    $arguments += @('--', 'sh', '-lc', "docker $normalizedCommand")

    try {
        $output = (& wsl.exe @arguments 2>&1 | Out-String)
        $exitCode = $LASTEXITCODE

        if ($exitCode -ne 0) {
            return @{ success = $false; stdout = ''; stderr = $output.Trim(); exitCode = $exitCode }
        }

        return @{ success = $true; stdout = $output; stderr = ''; exitCode = 0 }
    }
    catch {
        return @{ success = $false; stdout = ''; stderr = $_.Exception.Message; exitCode = 1 }
    }
}

function Get-RunningWslDistros {
    try {
        $lines = & wsl.exe -l -v 2>$null
    }
    catch {
        return @()
    }

    $distros = @()
    $excluded = @('docker-desktop', 'docker-desktop-data')
    foreach ($line in $lines) {
        $trimmed = ($line -replace [char]0, '').Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }
        if ($trimmed -match '^NAME\s+STATE\s+VERSION$') { continue }

        $clean = $trimmed.TrimStart('*').Trim()
        $m = [regex]::Match($clean, '^(?<name>.+?)\s{2,}(?<state>Running|Stopped|Installing|Uninstalling)\s{2,}(?<version>\d+)$')
        if (-not $m.Success) { continue }

        $name = $m.Groups['name'].Value.Trim()
        $state = $m.Groups['state'].Value.Trim()

        if ($state -eq 'Running' -and -not ($excluded -contains $name.ToLowerInvariant())) {
            $distros += $name
        }
    }

    return $distros
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $path = $request.Url.AbsolutePath.TrimEnd('/')

            if ($path -eq '/health') {
                $payload = @{ status = 'ok' }
                Write-JsonResponse $response 200 $payload
            }
            elseif ($path -eq '/wsl/running') {
                $running = Get-RunningWslDistros
                Write-JsonResponse $response 200 $running
            }
            elseif ($path -eq '/wsl/docker-exec' -and $request.HttpMethod -eq 'POST') {
                $body = Read-RequestJson $request
                $command = if ($body.command) { [string]$body.command } else { '' }
                $distro = if ($body.distro) { [string]$body.distro } else { '' }
                $result = Invoke-WslDockerCommand -DockerCommand $command -Distro $distro
                Write-JsonResponse $response 200 $result
            }
            else {
                $payload = @{ error = 'Not found' }
                Write-JsonResponse $response 404 $payload
            }
        }
        finally {
            $response.OutputStream.Close()
        }
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}
