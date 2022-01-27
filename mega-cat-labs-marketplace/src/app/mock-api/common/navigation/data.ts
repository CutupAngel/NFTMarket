/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Dashboard',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/dashboard'
    },
    {
        id      : 'product',
        title   : 'Product',
        type    : 'collapsable',
        icon    : 'heroicons_outline:pencil-alt',
        children: [
            {
                id   : 'product.list',
                title: 'Product List',
                type : 'basic',
                link : '/list-product'
            },
            {
                id   : 'product.create',
                title: 'Create Product',
                type : 'basic',
                link : '/create-product'
            }
        ]
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/dashboard'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/dashboard'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/dashboard'
    }
];
