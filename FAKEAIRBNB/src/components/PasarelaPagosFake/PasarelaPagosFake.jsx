import { useState } from "react";

const PasarelaPagos = () => {
    const [showModalPagos, setShowModalPagos] = useState(false);


    return (
        <div>
      
        <button className="btn btn-primary" onClick={() => setShowModalPagos(true)}>
          Confirmar Pago
        </button>
  


        {showModalPagos && (
          <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Pagos Seguros </h4>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShow(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <h5>Tarjeta de credito o debito</h5>
                  <form className="formu-pagos">
                    <input type="text" placeholder="Nombre del titular" />
                    <input type="text" placeholder="Número de tarjeta" />
                    <input type="text" placeholder="Fecha de expiración" />
                    <input type="text" placeholder="CVC" />

                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModalPagos(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {showModalPagos && <div className="modal-backdrop fade show"></div>}
      </div>
    );
  };
  
     









export default PasarelaPagos;