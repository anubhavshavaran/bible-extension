import ShareButton from "./ShareButton";
import { FaFacebook } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { getVerseImage } from "../../services/getVersesApi";
import Loader from "../ui/Loader";
import { useState } from "react";
import Logo from "../ui/Logo";
import logo from "./../../assets/imgs/SelahvieLogoWhite.webp";

type VersePropsType = {
    reference: string;
    text: string;
    mood: number;
    image: string;
    onClick: () => void;
}

const facebookCaption = "My verse for today’s journey | SelahVie https://selahvie.life/";

export default function Verse({ reference, text, image, onClick }: VersePropsType) {
    const [url, setUrl] = useState<string | null>(null);
    const strings = image.split("/");
    const { mutate, isPending, data } = useMutation({
        mutationKey: ['verseImage', text],
        mutationFn: () => getVerseImage(`${text} - ${reference}`, strings[(strings.length - 1)]),
        onSuccess: (data) => {
            window.open(`${url}${data.imageUrl}`, '_blank');
        },
        onError: (error) => {
            console.log(error);
        }
    });

    async function handleClick(url: string) {
        if (data) {
            console.log(data.imageUrl);

            window.open(`${url}${data.imageUrl}`, '_blank');
        } else {
            setUrl(url);
            mutate();
        }
    }

    return (
        <div className="w-full h-full relative overflow-hidden">
            <img src={image} alt="" className='object-cover h-full' loading="eager"/>

            <div className='absolute w-full h-min-[35%] bottom-0 flex flex-col gap-2 p-2 justify-center items-center'>
                <div onClick={onClick} className="w-full p-6 relative flex flex-col gap-8 justify-start items-start bg-white/50 rounded-[10px] border border-white/50 backdrop-blur-[30px]">
                    <p className="text-center text-black/80 text-xs font-normal font-['Montserrat'] leading-3 tracking-wide">{reference}</p>
                    <p className="text-center text-black text-lg font-normal font-['Montserrat'] leading-tight">{text}</p>

                    <Logo
                        img={logo}
                        classname="w-[80.43px] h-[97.73px] absolute top-[-45px] right-10"
                    />
                </div>
                <ShareButton
                    onClick={() => handleClick(`https://www.facebook.com/dialog/share?app_id=1047194497182929&display=popup&hashtag=${encodeURIComponent(facebookCaption)}&href=`)}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader />
                    ) : (
                        <div className="flex justify-center items-center gap-2">
                            <FaFacebook size={20} className="hover:text-facebookColor " />
                            <p className="text-center text-black text-lg font-medium font-['Medino']">Share</p>
                        </div>
                    )}
                </ShareButton>
            </div>
        </div>
    )
}