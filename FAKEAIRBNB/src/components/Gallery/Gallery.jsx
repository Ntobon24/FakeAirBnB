 

const Galeria = ({ FotosPropiedad }) => {
    if(!FotosPropiedad || FotosPropiedad.lenth ===0){
        return <p>Fotos no disponibles</p>
    }


  return (
   /* <div id="carouselExample" className="carousel slide">
      <div className="carousel-inner">
        {FotosPropiedad.map((img, index) => (
          <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
            <img src={img} className="d-block w-100" alt={`Imagen ${index + 1}`} />
          </div>
        ))}
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
        <span className="carousel-control-prev-icon"></span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
        <span className="carousel-control-next-icon"></span>
      </button>
    </div>
  );
};*/

<div className="container mt-4">
<div className="row g-3">
  {FotosPropiedad.map((img, index) => (
    <div className="col-6 col-md-4 col-lg-3" key={index}>
      <div className="card border-0 shadow-sm">
        <img
          src={img}
          className="card-img-top rounded"
          alt={`Imagen ${index + 1}`}
          style={{ height: "200px", objectFit: "cover" }}
        />
      </div>
    </div>
  ))}
</div>
</div>
);
};

export default Galeria;
