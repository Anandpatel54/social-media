import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
  VideoIcon,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const logouthandler = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandlar = (textType) => {
    if (textType === "Logout") {
      logouthandler();
    }
  };

  const sidebaritems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <VideoIcon />, text: "Reels" },
    { icon: <MessageCircle />, text: "Message" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];
  return (
    <div className="fixed top-0 z-10 left-0 border-r border-gray-300 px-4 w-[20%] h-screen">
      <div className="flex flex-col">
        <h1 className="my-8 pl-3 font-bold text-xl">LOGO</h1>
        <div>
          {sidebaritems.map((item, index) => {
            return (
              <div
                onClick={() => sidebarHandlar(item.text)}
                key={index}
                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-2"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
