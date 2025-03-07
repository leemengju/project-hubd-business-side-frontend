import React from "react";
import { SearchIcon } from "./icon";

export function ExportButton({ children }) {
  return (
    <button className="px-5 py-2.5 text-sm font-bold text-gray-500 rounded-md border border-solid cursor-pointer border-[color:var(--Blue-Normal,#626981)] max-sm:w-full">
      {children}
    </button>
  );
}



const SearchButton = ({ onClick }) => {
  return (
    <button
      className="mt-3 flex justify-center items-center bg-gray-500 rounded-none cursor-pointer border-[none] h-[58px] w-[58px]"
      aria-label="Search"
    >
      <SearchIcon />
    </button>
  );
};

export default SearchButton;


