import { IoIosNotifications } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
const Header = (props) => {
  return (
    <>
    <div className="grid grid-rows-2 grid-cols-2">
                   <p className="pt-5 pl-5 font-bold text-4xl font-serif">{props.message1} </p>
                   <div className="flex justify-end items-end mr-12 gap-7">
                    <button className="text-4xl"><IoSearch /></button>
                    <button className="text-4xl"><IoIosNotifications /></button>
                   </div>
                   <p className="pt-5 pl-5 font-bold text-lg italic">{props.message2}</p>
                   
                  </div>
    </>
  )
}

export default Header
