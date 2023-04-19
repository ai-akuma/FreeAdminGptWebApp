import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    }
  },
  {
    title: true,
    name: 'Manage Channels'
  },
  {
    name: 'Keep Productive & Earn',
    url: '/charts',
    iconComponent: { name: 'cil-media-play' }
  },
  {
    name: 'Clever Celebrity News',
    url: '/charts',
    linkProps: { fragment: 'someAnchor' },
    iconComponent: { name: 'cil-media-play' }
  },
  {
    name: 'Create',
    title: true
  },
  {
    name: 'Youtube Video',
    url: '/youtubeauto',
    iconComponent: { name: 'cil-media-play' },
    badge: {
      color: 'info',
      text: 'NEW'
    }
  },
  {
    name: 'Content Strategy',
    url: '/forms',
    iconComponent: { name: 'cil-notes' }
  },
  {
    name: 'Base',
    url: '/base',
    iconComponent: { name: 'cil-puzzle' },
    children: [
      {
        name: 'Accordion',
        url: '/base/accordion'
      },
      {
        name: 'Breadcrumbs',
        url: '/base/breadcrumbs'
      },
      {
        name: 'Cards',
        url: '/base/cards'
      },
      {
        name: 'Carousel',
        url: '/base/carousel'
      },
      {
        name: 'Collapse',
        url: '/base/collapse'
      },
      {
        name: 'List Group',
        url: '/base/list-group'
      },
      {
        name: 'Navs & Tabs',
        url: '/base/navs'
      },
      {
        name: 'Pagination',
        url: '/base/pagination'
      },
      {
        name: 'Placeholder',
        url: '/base/placeholder'
      },
      {
        name: 'Popovers',
        url: '/base/popovers'
      },
      {
        name: 'Progress',
        url: '/base/progress'
      },
      {
        name: 'Spinners',
        url: '/base/spinners'
      },
      {
        name: 'Tables',
        url: '/base/tables'
      },
      {
        name: 'Tabs',
        url: '/base/tabs'
      },
      {
        name: 'Tooltips',
        url: '/base/tooltips'
      }
    ]
  },
  {
    name: 'Buttons',
    url: '/buttons',
    iconComponent: { name: 'cil-cursor' },
    children: [
      {
        name: 'Buttons',
        url: '/buttons/buttons'
      },
      {
        name: 'Button groups',
        url: '/buttons/button-groups'
      },
      {
        name: 'Dropdowns',
        url: '/buttons/dropdowns'
      },
    ]
  },
  {
    name: 'Forms',
    url: '/forms',
    iconComponent: { name: 'cil-notes' },
    children: [
      {
        name: 'Form Control',
        url: '/forms/form-control'
      },
      {
        name: 'Select',
        url: '/forms/select'
      },
      {
        name: 'Checks & Radios',
        url: '/forms/checks-radios'
      },
      {
        name: 'Range',
        url: '/forms/range'
      },
      {
        name: 'Input Group',
        url: '/forms/input-group'
      },
      {
        name: 'Floating Labels',
        url: '/forms/floating-labels'
      },
      {
        name: 'Layout',
        url: '/forms/layout'
      },
      {
        name: 'Validation',
        url: '/forms/validation'
      }
    ]
  },
  {
    name: 'Trending Topics',
    iconComponent: { name: 'cil-star' },
    url: '/icons',
    children: [
      {
        name: 'Recommended',
        url: '/icons/coreui-icons',
        badge: {
          color: 'success',
          text: 'FREE'
        }
      },
      {
        name: 'Most Viewed',
        url: '/icons/flags'
      },
      {
        name: 'Highest Earning',
        url: '/icons/brands'
      }
    ]
  },
  {
    name: 'Notifications',
    url: '/notifications',
    iconComponent: { name: 'cil-bell' },
    children: [
      {
        name: 'New Trend Alert',
        url: '/notifications/alerts'
      },
      {
        name: 'Earned Badges',
        url: '/notifications/badges'
      },
      {
        name: 'Business Model',
        url: '/notifications/modal'
      },
      {
        name: 'Toast Competition',
        url: '/notifications/toasts'
      }
    ]
  },
  {
    title: true,
    name: 'Members Only' 
  },
  {
    name: 'Courses',
    url: '/login',
    iconComponent: { name: 'cil-star' },
    children: [
      {
        name: 'Login',
        url: '/login'
      },
      {
        name: 'Register',
        url: '/register'
      },
      // {
      //   name: 'Error 404',
      //   url: '/404'
      // },
      // {
      //   name: 'Error 500',
      //   url: '/500'
      // }
    ]
  },
];