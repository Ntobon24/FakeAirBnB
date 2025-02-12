 import "./Carrousel.css";

const Carrousel = ({ FotosPropiedad }) => {
    if(!FotosPropiedad || FotosPropiedad.lenth ===0){
        return <p>Fotos no disponibles</p>
    }


  return (

        <div id="carouselExample" className="carousel slide">
            <div className="carousel-inner">
                {FotosPropiedad.map((img, index) => (
                <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                    <img src={img} className="d-block w-100" alt={`Imagen ${index + 1}`} />
                </div>
                ))}
            </div>

            {/* Botones de de para atras */}
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev"  onClick={(e) => e.stopPropagation()}>
                <span className="carousel-control-prev-icon"></span>
            </button>

            {/* Botones de de para adelante */}
            <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next" onClick={(e) => e.stopPropagation()}>
                <span className="carousel-control-next-icon"></span>
            </button>
        </div>
  );
};
export default Carrousel;
