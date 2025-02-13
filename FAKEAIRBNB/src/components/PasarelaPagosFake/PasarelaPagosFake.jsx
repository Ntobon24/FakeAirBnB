import "./PasarelaPagosFake.css";
const PasarelaPagos = ( {onClose, onConfirm}) => {


    return (
        <div>
        
          <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Pagos Seguros </h4>
                  
                </div>
                <div className="modal-body">
                <h2>Tarjeta de credito o debito</h2>
                  <p>Ingresa los datos de tu tarjeta</p>
                  <form className="formu-pagos">
                    <input type="text" placeholder="Nombre del titular" />
                    <input type="text" placeholder="Número de tarjeta" />
                    <input type="text" placeholder="Fecha de expiración" />
                    <input type="text" placeholder="CVC" />

                  </form>
                </div>
                <div className="modal-footer">

                  {/* Estos son los botones que si confirma llama a la funcion pagar y si no pues no hace nada */}
                  <button className="btn-pasarela-cancelar" onClick={onClose}>
                    Cancelar Compra
                  </button>

                  <button className="btn-pasarela-pagos" onClick={onConfirm}>
                    Confirmar Pago
                  </button>
                </div>
              </div>
            </div>
          </div>
      
  
      </div>
    );
  };
  
     









export default PasarelaPagos;