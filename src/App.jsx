import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from '../pages/Login'
import Signup from "../pages/Signup"
import Dashboard from '../pages/user/Dashboard'
import EditProfile from "../pages/user/EditProfile"
import Clubs from "../pages/user/Posts"
import Events from "../pages/user/events pages/Events"
import Notes from "../pages/user/Notes"
import MarketPlace from "../pages/user/MarketPlace"
import AdminDashboard from "../pages/admin/AdminDashboard"
import AdminEdit from "./../pages/admin/AdminEdit"
import ManageNotes from "../pages/admin/ManageNotes"
import ManageClub from "./../pages/admin/ManageClub"
import ManageEvent from "./../pages/admin/ManageEvent"
import ManageMarket from "../pages/admin/ManageMarket"
import SellProduct from "../pages/user/SellProduct"
import SpecificProduct from "../pages/user/SpecificProduct"
import ViewCart from "../pages/user/ViewCart"
import OnboardingComplete from "../pages/user/OnboardingComplete"
import PaymentSuccess from "../pages/user/PaymentSuccess"
import PaymentCancelled from "../pages/user/PaymentCancelled"
import Discover from "../pages/user/club pages/Discover"
import JoinedClubs from "../pages/user/club pages/JoinedClubs"
import Posts from "../pages/user/Posts"
import CreateClub from "../pages/user/club pages/CreateClub"
import SpecificClub from "../pages/user/club pages/SpecificClub"
import ClubMembers from "../pages/user/club pages/ClubMembers"
import CreateEventForm from "../components/user/CreateEventForm"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/*User routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard"   element={<Dashboard />} />
           <Route path="/edit" element={<EditProfile />} />
           <Route path="/notes" element={<Notes />} />
           <Route path="/events" element={<Events />} />
           <Route path="/clubs" element={<Posts />} />
           <Route path="/market" element={<MarketPlace />} />
           <Route path="/sellProduct" element={<SellProduct />} />
           <Route path="/products/:id" element={<SpecificProduct />} />
           <Route path="/joinedClubs" element={<JoinedClubs />} />
           <Route path="/discoverClubs" element={<Discover />} />
            <Route path="/createClub" element={<CreateClub />} />
            <Route path="/club/:id" element={<SpecificClub />} />
            <Route path="/club/:id/members" element={<ClubMembers />} />
            <Route path="/createEvent/:id" element={<CreateEventForm />} />
           {/* Admin routes */}
           <Route path="/AdminDashboard" element={<AdminDashboard />} />
           <Route path="/AdminEdit" element={<AdminEdit />} />
           <Route path="/manageNotes" element={<ManageNotes />} />
           <Route path="/manageEvents" element={<ManageEvent />} />
           <Route path="/manageMarket" element={<ManageMarket />} />
           <Route path="/manageClub" element={<ManageClub />} />
           <Route path="/viewCart" element={<ViewCart />} />
           <Route path="/onboarding-complete" element={<OnboardingComplete />} />
           <Route path="/payment-success" element={<PaymentSuccess />} />
           <Route path="/payment-cancelled" element={<PaymentCancelled />} />
        </Routes>
      </BrowserRouter>
      
    </>
  )
}

export default App
