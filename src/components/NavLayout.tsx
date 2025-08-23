import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

interface NavList {
  text: string;
  link: string;
}

const NavLayout = () => {
  const location = useLocation();
  const [selectedNavItem, setNavItem] = useState<string>("");

  const navList: NavList[] = [
    { text: "Index", link: "/" },
    { text: "Test", link: "/test" },
  ];

  useEffect(() => {
    setNavItem(location.pathname);
  }, [location]);

  return (
    <>
      <nav className="flex justify-end w-full px-5 py-3 bg-cyan-950">
        <span className="text-sky-100 text-sm">
          Note: Currently using news source country as location (NLP content
          analysis pending)
        </span>
        {navList.map((item) => (
          <NavLink
            key={item.text}
            to={item.link}
            className={`
        px-3 py-2 ml-2
        ${selectedNavItem === item.link ? "text-sky-400" : "text-sky-100"}
        `}
          >
            {item.text}
          </NavLink>
        ))}
      </nav>

      {/* main content */}
      <Outlet />
    </>
  );
};

export default NavLayout;
