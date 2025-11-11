import * as React from "react";
import { styled } from "@mui/material/styles";
import {
  Drawer as MuiDrawer,
  Toolbar,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PeopleIcon from "@mui/icons-material/People";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

export default function DrawerComponent({
  open,
  toggleDrawer,
  currentPage,
  setCurrentPage,
  mobileOpen,
  onMobileClose,
}) {
  const menuItems = [
    {
      text: "Overview",
      icon: <DashboardIcon />,
      page: "overview",
    },
    {
      text: "Invoices",
      icon: <ReceiptIcon />,
      page: "invoices",
    },
    {
      text: "Clients",
      icon: <PeopleIcon />,
      page: "clients",
    },
  ];

  const handleMenuItemClick = (page) => {
    setCurrentPage(page);
    // Close mobile drawer when item is clicked
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const drawerContent = (isMobile = false) => (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
        }}
      >
        {(open || isMobile) && (
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Invoice App
          </Typography>
        )}
        {!isMobile && (
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List component="nav">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              selected={currentPage === item.page}
              onClick={() => handleMenuItemClick(item.page)}
              sx={{
                minHeight: 48,
                justifyContent: open || isMobile ? "initial" : "center",
                px: 2.5,
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open || isMobile ? 3 : "auto",
                  justifyContent: "center",
                  color:
                    currentPage === item.page ? "inherit" : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  opacity: open || isMobile ? 1 : 0,
                  "& .MuiTypography-root": {
                    fontWeight: currentPage === item.page ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawerContent(true)}
      </MuiDrawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        {drawerContent(false)}
      </Drawer>
    </>
  );
}
