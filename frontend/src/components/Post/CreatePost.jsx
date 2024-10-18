import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const fileChangeHandlar = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };
  const createpstHandlar = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/post/addpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Dialog open={open}>
        <DialogContent onInteractOutside={() => setOpen(false)}>
          <DialogHeader className="text-center font-semibold">
            Create new post
          </DialogHeader>
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src="" alt="image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-xs">username</h1>
              <span className="font-semibold text-xs text-gray-600">
                Bio here....
              </span>
            </div>
          </div>
          <Textarea
            className="focus-visible:ring-transparent border-none"
            placeholder="Write a caption.."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          {imagePreview && (
            <div className="w-full h-64 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="preview_img"
                className="object-cover h-full w-full rounded-md"
              />
            </div>
          )}
          <input
            ref={imageRef}
            type="file"
            className="hidden"
            onChange={fileChangeHandlar}
          />
          <Button
            onClick={() => imageRef.current.click()}
            className="w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]"
          >
            Select from computer
          </Button>
          {imagePreview &&
            (loading ? (
              <Button>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button onClick={createpstHandlar} type="submit">
                Post
              </Button>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePost;