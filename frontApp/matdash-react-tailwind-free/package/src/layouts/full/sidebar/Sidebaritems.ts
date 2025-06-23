export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  isPro?: boolean
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  isPro?: boolean
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  // {
  //   heading: "HOME",
  //   children: [
  //     {
  //       name: "Dashboard",
  //       icon: "solar:widget-add-line-duotone",
  //       id: uniqueId(),
  //       url: "/dashboard",
  //       isPro: false,
  //     },
  //   ],
  // },
];

export default SidebarContent;
