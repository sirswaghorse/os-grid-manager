import { useLocation } from "wouter";

export function useNavigate() {
  const [location, setLocation] = useLocation();
  
  const navigate = (path: string) => {
    setLocation(path);
  };
  
  return [location, navigate] as const;
}