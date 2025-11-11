import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Button,
  InputBase,
  Breadcrumbs,
  Link,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  marginLeft: 0,
  marginRight: theme.spacing(2),
  width: "100%",
  maxWidth: 400,
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function AppBarComponent({ open, toggleDrawer, currentPage }) {
  const { isAuthenticated, user, logout } = useAuth();
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getBreadcrumb = () => {
    switch (currentPage) {
      case "overview":
        return "Home";
      case "invoices":
        return "Invoices";
      case "clients":
        return "Clients";
      default:
        return "Home";
    }
  };

  return (
    <AppBar position="absolute" open={open}>
      <Toolbar
        sx={{
          pr: "24px",
          minHeight: "64px !important",
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          sx={{
            marginRight: "24px",
            ...(open && {
              display: { xs: "block", sm: "none" },
            }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Breadcrumbs
          separator="›"
          aria-label="breadcrumb"
          sx={{
            color: "text.secondary",
            "& .MuiBreadcrumbs-separator": {
              color: "text.secondary",
            },
          }}
        >
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
          <Typography color="text.secondary">{getBreadcrumb()}</Typography>
        </Breadcrumbs>
        <Box sx={{ flexGrow: 1 }} />
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
          />
        </Search>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 18 }} />
            <Typography
              variant="body2"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              {currentDate}
            </Typography>
          </Box>
          {isAuthenticated && user && (
            <>
              <IconButton color="inherit">
                <Badge badgeContent={0} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={logout}
                size="small"
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
