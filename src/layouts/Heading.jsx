import testImg from "../assets/images/home_test.png";

const Heading = () => {
  return (
    <div className="w-full h-[106px] py-[15px] flex justify-center items-center">
      <div className="w-[50%] h-full flex justify-start items-center">
        <div className="flex flex-col justify-center items-start w-[210px] h-[full]">
          <p className="font-semibold text-[20px]">
            Hello, <span>Robert</span>
          </p>
          <p className="text-[14px] text-brandGray-normalLight">歡迎回來</p>
        </div>
      </div>
      <div className="w-[50%] h-full flex justify-end items-center">
        <div className="flex justify-center items-center">
          <div className="w-[50px] h-[50px] flex justify-center items-center bg-brandGray-light rounded-lg text-brandGray-dark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M10 21h4c0 1.1-.9 2-2 2s-2-.9-2-2m11-2v1H3v-1l2-2v-6c0-3.1 2-5.8 5-6.7V4c0-1.1.9-2 2-2s2 .9 2 2v.3c3 .9 5 3.6 5 6.7v6zm-4-8c0-2.8-2.2-5-5-5s-5 2.2-5 5v7h10z"
              />
            </svg>
          </div>
          <div>
            <div className="ms-5 w-[195px] h-[66px] flex justify-center items-center p-2">
              <div className="w-[50px] h-[50px] rounded-lg">
                <img
                  src={testImg}
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              </div>
              <div className="ms-[6px]">
                <p className="font-semibold text-[20px]">Rebert Allen</p>
                <p className="text-[14px] text-brandGray-normalLight">CEO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heading;
