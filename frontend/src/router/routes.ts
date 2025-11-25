import type { RouteRecordRaw } from 'vue-router'
import ContainersView from '../views/ContainersView.vue'
import ContainerDetailsView from '../views/ContainerDetailsView.vue'
import ImagesView from '../views/ImagesView.vue'
import VolumesView from '../views/VolumesView.vue'
import NetworksView from '../views/NetworksView.vue'
import DashboardView from '../views/DashboardView.vue'
import DockerCommandsView from '../views/DockerCommandsView.vue'
import ResourcesView from '../views/ResourcesView.vue'
import InstallationView from '../views/InstallationView.vue'
import AboutView from '../views/AboutView.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Dashboard',
        component: DashboardView
    },
    {
        path: '/containers',
        name: 'Containers',
        component: ContainersView
    },
    {
        path: '/containers/:id',
        name: 'ContainerDetails',
        component: ContainerDetailsView,
        props: true
    },
    {
        path: '/images',
        name: 'Images',
        component: ImagesView
    },
    {
        path: '/volumes',
        name: 'Volumes',
        component: VolumesView
    },
    {
        path: '/networks',
        name: 'Networks',
        component: NetworksView
    },
    {
        path: '/commands',
        name: 'DockerCommands',
        component: DockerCommandsView
    },
    {
        path: '/resources',
        name: 'Resources',
        component: ResourcesView
    },
    {
        path: '/installation',
        name: 'Installation',
        component: InstallationView
    },
    {
        path: '/about',
        name: 'About',
        component: AboutView
    }
]

export default routes