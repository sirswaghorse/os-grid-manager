import { 
  TableProperties,
  LayoutDashboard,
  Grid,
  User,
  Settings,
  HelpCircle,
  Menu,
  Bell,
  Plus,
  RotateCw,
  Trash2,
  Edit,
  ZoomIn,
  Rocket,
  Search,
  X,
  Check 
} from "lucide-react";

export function DashboardIcon(props: TableProperties) {
  return <LayoutDashboard {...props} />;
}

export function GridIcon(props: TableProperties) {
  return <Grid {...props} />;
}

export function UserIcon(props: TableProperties) {
  return <User {...props} />;
}

export function SettingsIcon(props: TableProperties) {
  return <Settings {...props} />;
}

export function HelpIcon(props: TableProperties) {
  return <HelpCircle {...props} />;
}

export function MenuIcon(props: TableProperties) {
  return <Menu {...props} />;
}

export function BellIcon(props: TableProperties) {
  return <Bell {...props} />;
}

export function PlusIcon(props: TableProperties) {
  return <Plus {...props} />;
}

export function RestartIcon(props: TableProperties) {
  return <RotateCw {...props} />;
}

export function TrashIcon(props: TableProperties) {
  return <Trash2 {...props} />;
}

export function EditIcon(props: TableProperties) {
  return <Edit {...props} />;
}

export function ZoomIcon(props: TableProperties) {
  return <ZoomIn {...props} />;
}

export function RocketIcon(props: TableProperties) {
  return <Rocket {...props} />;
}

export function SearchIcon(props: TableProperties) {
  return <Search {...props} />;
}

export function CloseIcon(props: TableProperties) {
  return <X {...props} />;
}

export function CheckIcon(props: TableProperties) {
  return <Check {...props} />;
}
