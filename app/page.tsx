// import Image from "next/image";
// import Link from 'next/link';

// export default function Home() {
//   return (
//     <Link href="/create-new-app">
//         <button>create new app</button>
//     </Link>
//   );
// }

// pages/index.jsx
const imgHomePage = "/buff.jpeg";

export default function HomePage() {
  return (
    <div className="relative size-full" data-name="Home Page" data-node-id="67:847">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-white inset-0" />
        <img
          alt=""
          className="absolute max-w-none object-50%-50% object-cover opacity-50 size-full"
          src={imgHomePage}
        />
      </div>

      <a
        className="absolute bg-black box-border content-stretch cursor-pointer flex gap-[10px] items-center justify-center left-[95px] px-[45px] py-0 top-[812px]"
        data-name="Admin to working"
        data-node-id="76:1245"
      >
        <div
          className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-center text-white whitespace-nowrap"
          data-node-id="I76:1245;76:1242"
        >
          <p className="leading-[normal]">Im an admin bro</p>
        </div>
      </a>

      <a
        className="absolute block cursor-pointer h-[111px] left-[103px] top-[195px] w-[188px]"
        data-name="Login Button"
        data-node-id="81:39"
      >
        <div
          className="absolute bg-[#cfb87c] h-[111px] left-0 rounded-[23px] top-0 w-[188px]"
          data-name="Login Button Frame"
          data-node-id="I81:39;81:24"
        >
          <div
            className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[52px] justify-center leading-[0] left-[calc(50%+-0.5px)] not-italic text-[25px] text-center text-white top-[calc(50%+0.5px)] translate-x-[-50%] translate-y-[-50%] w-[99px]"
            data-node-id="I81:39;81:24;67:851"
          >
            <p className="leading-[normal] whitespace-pre-wrap">Login</p>
          </div>
        </div>
      </a>

      <a
        className="absolute bg-[#cfb87c] box-border content-stretch cursor-pointer flex gap-[10px] h-[114px] items-center justify-center left-[103px] p-[10px] rounded-[23px] top-[581px] w-[188px]"
        data-node-id="81:54"
      >
        <div
          className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[124px] justify-center leading-[0] not-italic relative shrink-0 text-[25px] text-center text-white w-[237px]"
          data-node-id="I81:54;76:792"
        >
          <p className="leading-[normal] whitespace-pre-wrap">Create New Account</p>
        </div>
      </a>
    </div>
  );
}