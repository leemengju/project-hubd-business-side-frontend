
import React from "react";

const DocumentIcon=()=> (
 
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="nav-icon"
    >
      <path
        d="M8 10H16M8 14H16M8 18H12M8 4C8 5.10457 8.89543 6 10 6H14C15.1046 6 16 5.10457 16 4M8 4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4M8 4H7C4.79086 4 3 5.79086 3 8V18C3 20.2091 4.79086 22 7 22H17C19.2091 22 21 20.2091 21 18V8C21 5.79086 19.2091 4 17 4H16"
        stroke="#484848"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
 ); 


export const DropdownIcon = () => (
  <svg
    width="20"
    height="21"
    viewBox="0 0 20 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="dropdown-icon"
  >
    <path
      d="M5.5 8.3999L9.62835 12.987C9.82697 13.2077 10.173 13.2077 10.3716 12.987L14.5 8.3999"
      stroke="#626981"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const CalendarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="calendar-icon"
  >
    <path
      d="M8 9.3999H12M8 13.3999H16M8 17.3999H16M15.9995 2.3999V5.3999M7.99951 2.3999V5.3999M7 3.8999H17C19.2091 3.8999 21 5.69076 21 7.8999V18.3999C21 20.609 19.2091 22.3999 17 22.3999H7C4.79086 22.3999 3 20.609 3 18.3999V7.8999C3 5.69076 4.79086 3.8999 7 3.8999Z"
      stroke="#484848"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SearchIcon = () => (
  <svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="search-icon"
  >
    <g clipPath="url(#clip0_search_icon)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.4601 10.7187L15.7639 15.0225C15.9151 15.1738 16.0001 15.3791 16 15.5931C15.9999 15.8071 15.9148 16.0123 15.7635 16.1636C15.6121 16.3149 15.4068 16.3998 15.1928 16.3997C14.9788 16.3997 14.7736 16.3146 14.6223 16.1632L10.3185 11.8594C9.03194 12.8559 7.41407 13.3248 5.79403 13.1708C4.17398 13.0168 2.67346 12.2514 1.59771 11.0303C0.521957 9.80926 -0.0482098 8.22423 0.00319691 6.59769C0.0546036 4.97115 0.723722 3.42529 1.87443 2.27458C3.02514 1.12387 4.57101 0.45475 6.19754 0.403343C7.82408 0.351937 9.40911 0.922104 10.6302 1.99785C11.8513 3.0736 12.6167 4.57413 12.7707 6.19417C12.9247 7.81422 12.4558 9.43209 11.4593 10.7187H11.4601ZM6.4003 11.5994C7.67328 11.5994 8.89412 11.0937 9.79425 10.1936C10.6944 9.29347 11.2001 8.07262 11.2001 6.79964C11.2001 5.52666 10.6944 4.30582 9.79425 3.40569C8.89412 2.50556 7.67328 1.99987 6.4003 1.99987C5.12732 1.99987 3.90648 2.50556 3.00634 3.40569C2.10621 4.30582 1.60052 5.52666 1.60052 6.79964C1.60052 8.07262 2.10621 9.29347 3.00634 10.1936C3.90648 11.0937 5.12732 11.5994 6.4003 11.5994Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_search_icon">
        <rect
          width="16"
          height="16"
          fill="white"
          transform="translate(0 0.399902)"
        />
      </clipPath>
    </defs>
  </svg>
);
export default DocumentIcon;