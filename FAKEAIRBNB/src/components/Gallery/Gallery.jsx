const Galeria = ({ FotosPropiedad }) => {
  if (!FotosPropiedad || FotosPropiedad.length === 0) {
    return <p>Fotos no disponibles</p>;
  }

  return (
    <div className="container mt-4">
      <div className="row g-3">
        {FotosPropiedad.map((img) => (
          <div className="col-6 col-md-4 col-lg-3" key={img}>
            <div className="card border-0 shadow-sm">
              <img
                src={img}
                className="card-img-top rounded"
                alt="Imagen de la propiedad"
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
