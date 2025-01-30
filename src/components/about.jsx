import React from "react";

export const About = (props) => {
  return (
    <div id="about">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-6">
            {" "}
            <img src="img/apt.png" className="img-responsive" alt="" />{" "}
          </div>
          <div className="col-xs-12 col-md-6">
            <div className="about-text">
              <h2>Online Appointments</h2>
              <p>Say goodbye to long queues and scheduling hassles! Petopia allows pet owners to book online 
                appointments easily, ensuring a smooth and efficient visit to pet shops and veterinary clinics in Iligan City.
                With just a few clicks, you can schedule grooming sessions, veterinary checkups, and other pet services—anytime, 
                anywhere. Our system reduces waiting times by keeping schedules organized and ensuring that pet professionals are 
                ready for every visit.
              </p>
              
              <div className="list-style">
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul>
                    <p>✓ Easy Online Appointment Booking – Schedule vet visits, grooming sessions, and other pet services in just a few clicks.</p>
                    <p>✓ Automated Reminders – Never miss an appointment again with SMS and email notifications.</p>
                  </ul>
                </div>
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul>
                    <p>✓ Business Management Tools – Pet shops and clinics can track bookings, manage availability, and improve customer service.</p>
                    <p>✓ Convenience for Pet Owners – Find the best pet services in Iligan City anytime, anywhere.</p>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
