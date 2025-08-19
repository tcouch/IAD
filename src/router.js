import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { Root } from './routes/__root'
import { Index } from './routes/index'
import { Academies } from './routes/academies'
import { AcademyDetail } from './routes/academies.$academyId'
import { People } from './routes/people'
import { PersonDetail } from './routes/people.$personId'
import { Works } from './routes/works'
import { WorkDetail } from './routes/works.$workId'

// Create routes manually
const rootRoute = createRootRoute({
    component: Root,
})

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Index,
})

const academiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/academies',
    component: Academies,
})

const academiesAcademyIdRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/academies/$academyId',
    component: AcademyDetail,
})

const peopleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/people',
    component: People,
})

const peoplePersonIdRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/people/$personId',
    component: PersonDetail,
})

const worksRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/works',
    component: Works,
})

const worksWorkIdRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/works/$workId',
    component: WorkDetail,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    academiesRoute,
    academiesAcademyIdRoute,
    peopleRoute,
    peoplePersonIdRoute,
    worksRoute,
    worksWorkIdRoute,
])

// Create the router
export const router = createRouter({
    routeTree,
    // Add this for GitHub Pages compatibility
    base: import.meta.env.DEV ? '/' : '/IAD'
})

// Export the base path for use in other components
export const getBasePath = () => import.meta.env.DEV ? '' : '/IAD' 