import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../../components/Header'
import axios from 'axios'
import EventCard from '../../../components/user/EventCard'

const Events = () => {

  const { id } = useParams();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.userId;
  const [events, setEvents] = useState([]);
  const [clubsJoined, setClubsJoined] = useState([]);

  useEffect(() => {
    if (id) {
      // If viewing specific club events
      setClubsJoined([id]);
    } else {
      // Otherwise fetch all joined clubs
      if (!userId) return;

      axios.get("http://localhost:3000/user/getUserClubs", {
        params: {
          userId: userId
        }
      })
        .then((response) => {
          console.log("Joined clubs:", response.data);
          setClubsJoined(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user clubs:", error);
        })
    }
  }, [userId, id])

  useEffect(() => {
    if (!Array.isArray(clubsJoined) || clubsJoined.length === 0) return;

    console.log("Fetching events for clubs:", clubsJoined);

    axios.post("http://localhost:3000/eventFunctions/getEvents", {
      userClubs: clubsJoined,
      // userId is optional depending on if we want to show created events even if not joined,
      // but usually if we are just viewing a club's events we might just want that club's events.
      // Keeping userId ensures we also see events created by user if logic requires it, 
      // but for specific club view, passing just the ID in userClubs is enough based on backend logic.
      userId: id ? null : userId
    })
      .then((response) => {
        console.log("Events fetched:", response.data);
        setEvents(response.data.events || []);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });

  }, [clubsJoined, id, userId]);


  return (
    <>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header message1="Events" message2="Stay updated with latest club activities" />
        <div className="overflow-y-auto p-4 flex-1">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Upcoming Events</h1>

            {events.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">No events found for your clubs.</p>
                <p className="text-gray-400 mt-2">Join more clubs to see their events here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => {
                  return <EventCard key={event._id || index} event={event} />
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Events
