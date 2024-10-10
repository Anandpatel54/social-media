import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";

const CommentDialog = ({ open, setOpen }) => {
  return (
    <div>
      <Dialog open={open}>
        <DialogContent
          onInteractOutside={() => setOpen(false)}
          className="max-w-3xl p-0 flex flex-col"
        >
          <div className="flex flex-1">
            <div className="w-1/2">
              <img
                className="rounded-l-md w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1726856667612-5252bd459a69?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3fHx8ZW58MHx8fHx8"
                alt="post_img"
              />
            </div>
            <div className="w-1/2 flex flex-col justify-between">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Link>
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link className="font-semibold">username</Link>
                    {/*  <span className="text-gray-600 text-sm">Bio here....</span>*/}
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <MoreHorizontal className="cursor-pointer" />
                  </DialogTrigger>
                  <DialogContent className="flex flex-col items-center text-sm text-center">
                    <Button
                      variant="ghost"
                      className="cursor-pointer w-fit text-[#ED4956] font-bold"
                    >
                      Unfollow
                    </Button>
                    <Button variant="ghost" className="cursor-pointer w-fit">
                      Add to favorites
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
              <hr />
              <div className="flex-1 overflow-y-auto max-h-94 p-4">
                comments ayege comments ayege comments ayege comments ayege
                comments ayegecomments ayege
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment...."
                    className="outline-none text-sm w-full border border-gray-300 p-2 rounded-md"
                  />
                  <Button variant="outline" className="">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommentDialog;
