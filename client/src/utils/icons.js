import {
  BiHomeAlt,
  BiSearch,
  BiCompass,
  BiUser,
  BiHeart,
  BiPlusCircle,
  BiX,
} from "react-icons/bi";

import {
  HiOutlineMenu,
  HiOutlineDotsHorizontal,
  HiOutlineLogout,
} from "react-icons/hi";

import { FiMessageSquare } from "react-icons/fi";

import { PiFilmReel } from "react-icons/pi";

import { IoCloseCircleSharp, IoCall } from "react-icons/io5";

import { RiLoader4Line } from "react-icons/ri";

import {
  BsToggleOff,
  BsToggleOn,
  BsFillPostcardHeartFill,
} from "react-icons/bs";

import {
  MdOutlineSecurity,
  MdLockOutline,
  MdStars,
  MdOutlineLightMode,
  MdOutlineMailOutline,
} from "react-icons/md";

import { TbUserEdit, TbMessageReport } from "react-icons/tb";

import { ImBlocked } from "react-icons/im";

import { FaHeart, FaXTwitter } from "react-icons/fa6";

import {
  FaRegHeart,
  FaRegComment,
  FaRegBookmark,
  FaChevronDown,
  FaCog,
  FaGoogle,
  FaFacebook,
  FaEye,
  FaEyeSlash,
  FaRegCircle,
} from "react-icons/fa";

import {
  IoIosArrowDown,
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdNotificationsOutline,
  IoIosCheckmarkCircle,
} from "react-icons/io";

export const Icon = {
  Home: BiHomeAlt,
  Search: BiSearch,
  Explore: BiCompass,
  User: BiUser,
  Menu: HiOutlineMenu,

  Heart: BiHeart,
  HeartOutline: FaRegHeart,
  HeartFilled: FaHeart,
  Plus: BiPlusCircle,
  Close: BiX,
  CloseCircle: IoCloseCircleSharp,
  DotsHorizontal: HiOutlineDotsHorizontal,
  Logout: HiOutlineLogout,

  Message: FiMessageSquare,
  Comment: FaRegComment,
  Reel: PiFilmReel,
  Bookmark: FaRegBookmark,
  Post: BsFillPostcardHeartFill,

  ChevronDown: FaChevronDown,
  Setting: FaCog,
  ArrowBack: IoIosArrowBack,
  ArrowRight: IoIosArrowForward,
  ArrowDown: IoIosArrowDown,
  Loader: RiLoader4Line,
  toggleOn: BsToggleOn,
  toggleOff: BsToggleOff,
  Circle: FaRegCircle,
  Checked: IoIosCheckmarkCircle,

  Security: MdOutlineSecurity,
  Lock: MdLockOutline,
  EditUser: TbUserEdit,
  Notification: IoMdNotificationsOutline,
  Block: ImBlocked,
  Report: TbMessageReport,

  Star: MdStars,
  Theme: MdOutlineLightMode,
  OnEye: FaEye,
  OffEye: FaEyeSlash,

  Email: MdOutlineMailOutline,
  Call: IoCall,

  Google: FaGoogle,
  Facebook: FaFacebook,
  Twitter: FaXTwitter,
};
