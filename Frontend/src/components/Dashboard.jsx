import { useState, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import AppBarComponent from "./AppBar";
import DrawerComponent from "./Drawer";
import MyInvoices from "./MyInvoices";
import Overview from "./Overview";
import Clients from "./Clients";
import LoginDialog from "./LoginDialog";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 240;

// Modern Dark Mode Theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6366f1",
      light: "#818cf8",
      dark: "#4f46e5",
    },
    secondary: {
      main: "#ec4899",
      light: "#f472b6",
      dark: "#db2777",
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    divider: "rgba(255, 255, 255, 0.1)",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: 24,
    },
    h5: {
      fontWeight: 600,
      fontSize: 20,
    },
    h6: {
      fontWeight: 600,
      fontSize: 18,
    },
    body1: {
      fontSize: 14,
    },
    body2: {
      fontSize: 12,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#1e293b",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#1e293b",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0f172a",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 64,
    },
  },
});

function DashboardContent() {
  const { isAuthenticated, loading } = useAuth();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("overview");
  const [loginOpen, setLoginOpen] = useState(false);

  const toggleDrawer = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLoginOpen(true);
    }
  }, [loading, isAuthenticated]);

  // Update drawer state when mobile breakpoint changes
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isMobile]);

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <Overview />;
      case "invoices":
        return <MyInvoices />;
      case "clients":
        return <Clients />;
      default:
        return <Overview />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <AppBarComponent
          open={drawerOpen}
          toggleDrawer={toggleDrawer}
          currentPage={currentPage}
        />
        <DrawerComponent
          open={drawerOpen}
          toggleDrawer={toggleDrawer}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          mobileOpen={mobileDrawerOpen}
          onMobileClose={handleMobileDrawerClose}
        />
        <Box
          component="main"
          sx={{
            backgroundColor: "#0f172a",
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
            transition: (theme) =>
              theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            marginLeft: `-${drawerWidth}px`,
            ...(drawerOpen && {
              transition: (theme) =>
                theme.transitions.create("margin", {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              marginLeft: 0,
            }),
          }}
        >
          <Toolbar />
          <Container maxWidth="xl" sx={{ mt: 3, mb: 4, px: 3 }}>
            {isAuthenticated ? (
              renderPage()
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "60vh",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography variant="h5">Please log in to continue</Typography>
                <Button variant="contained" onClick={() => setLoginOpen(true)}>
                  Login
                </Button>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

export default function Dashboard() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardContent />
    </ThemeProvider>
  );
}
