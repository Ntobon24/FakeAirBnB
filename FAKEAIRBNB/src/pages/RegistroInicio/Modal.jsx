import React from "react";
import "./Modal.css";
function Modal({ show, onClose , children }) {
  return (
    <div className={`modal ${show ? "d-block" : "d-none"}`} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Iniciar sesión </h4>
            <button type="button" className="btn-close" onClick={onClose}>
                
            </button>
          </div>
          <h5 className= "segundo-titulo-modal">Te damos la bienvenida a FakeAirbnb</h5>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
