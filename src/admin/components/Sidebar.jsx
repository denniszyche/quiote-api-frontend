import classNames from "classnames";

const Sidebar = ({isMobile, children }) => {

    const sidebarClass = classNames("admin-page-content__sidebar", {
        "isMobile": isMobile,
        "isDesktop": !isMobile,
    });

    return (
        <div className={sidebarClass}>
            {children}
        </div>
    );
};
export default Sidebar;