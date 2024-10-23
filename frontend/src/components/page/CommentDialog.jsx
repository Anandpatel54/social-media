import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useSelector } from "react-redux";
import Comment from "./Comment";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost } = useSelector((store) => store.post);

  const changeEventHandlar = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };
  const sendMessageHandlar = async (e) => {
    e.preventDefault();
    alert(text);
  };
  return (
    <div>
      <Dialog open={open}>
        <DialogContent
          onInteractOutside={() => setOpen(false)}
          className="max-w-3xl p-0 flex flex-col"
        >
          <div className="flex flex-1">
            <div className="w-1/2 h-[55vh]">
              <img
                className="rounded-l-md w-full h-full object-cover"
                src={selectedPost?.image}
                alt="post_img"
              />
            </div>
            <div className="w-1/2 flex flex-col justify-between">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Link>
                    <Avatar>
                      <AvatarImage src={selectedPost?.author?.profilePicture} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link className="font-semibold">
                      {selectedPost?.author?.username}
                    </Link>
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
                {selectedPost?.comments.map((comment) => (
                  <Comment key={comment._id} comment={comment} />
                ))}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment...."
                    onChange={changeEventHandlar}
                    value={text}
                    className="outline-none text-sm w-full border border-gray-300 p-2 rounded-md"
                  />
                  <Button
                    onClick={sendMessageHandlar}
                    disabled={!text.trim()}
                    variant="outline"
                    className=""
                  >
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
