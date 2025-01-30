import React from "react";

export const About2 = (props) => {
  return (
    <div id="about">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <div className="about-text">
              <h2>Make It Easy for Pet Owners to Find You</h2>
              <p>We all want the best care for our furry friends. Find the right vet and 
                booking an appointment! Long waiting times, fully booked clinics, and last-minute 
                scheduling issues can make pet care stressful. Petopia is a seamless and efficient online appointment system that 
                connects pet owners with trusted veterinarians in Iligan City.
              </p>
              
              <div className="list-style">
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul>
                    
                  </ul>
                </div>
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul>
                    
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xs-12 col-md-6">
            {" "}
            <img src="img/vet.jpg" className="img-responsive" alt="" />{" "}
          </div>
        </div>
      </div>
    </div>
  );
};
