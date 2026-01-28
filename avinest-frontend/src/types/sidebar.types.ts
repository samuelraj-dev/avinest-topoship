export type SidebarItem = {
  label: string;
  to: string;
  exact?: boolean;
};

export type SidebarConfig = {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
};
