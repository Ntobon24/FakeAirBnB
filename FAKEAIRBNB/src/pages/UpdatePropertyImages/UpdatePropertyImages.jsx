import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { updateDoc, doc } from "firebase/firestore";

const UpdatePropertyImages = () => {
  const [status, setStatus] = useState("Actualizando fotos...");

  useEffect(() => {
    const updatedImagesProperties = {
      //Titulo: Cabaña rústica en Santa Elena
      STMWle3t47g878QP7VTF: [
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1489407757885907396/original/5634e410-234e-4920-89a5-a7ae690c0812.jpeg?im_w=960",
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1489407757885907396/original/54461860-00bc-48f8-93a8-75d8c409ec36.jpeg?im_w=1200",
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1489407757885907396/original/85246f20-298c-44ab-97c6-4808d460fe70.jpeg?im_w=1200",
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1489407757885907396/original/36f833cf-8a1b-4bf0-9135-e69c701fd6e9.jpeg?im_w=720",
      ],

      //Titulo: Finca en Guatapé con vista al lago
      iRm8nacirUNBm97zrBpi: [
        "https://a0.muscache.com/im/pictures/miso/Hosting-719545068841795318/original/dfe4a6df-7295-49ae-a23d-8be19323ccb3.jpeg?im_w=1200&im_format=avif",
        "https://a0.muscache.com/im/pictures/miso/Hosting-719545068841795318/original/4161e813-2f2b-491b-8e95-33345414ed37.jpeg?im_w=1200&im_format=avif",
        "https://a0.muscache.com/im/pictures/miso/Hosting-719545068841795318/original/8ed27897-496c-4128-87c5-85c9ee4e64f3.jpeg?im_w=1200&im_format=avif",
        "https://a0.muscache.com/im/pictures/miso/Hosting-719545068841795318/original/0bfeb690-d515-419e-8b3e-8d056941ec24.jpeg?im_w=720&im_format=avif",
      ],

      //Titulo: Apartamento en El Poblado con jacuzzi
      fE0xMpaZrACIfST5gCdH: [
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/478805172.jpg?k=93763c4acb973c93e81f418041394913f250c94c1d3ee71c27a1bdea39c55030&o=&hp=1",
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/598124760.jpg?k=564644e09f0c6221c0deef4c2ca712fd3a4a7a42fa37c7ce9473f60faf08820f&o=&hp=1",
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/496986320.jpg?k=ab3c12bf97ff84a342669dc58335cff38535f7f37730799e87e0cf475f2ba299&o=&hp=1",
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/496986325.jpg?k=3860ed3d72faab899954bb36267accda22630a3e9742718bac0467adda7d66e2&o=&hp=1",
      ],

      //Titulo: Hostal en Jericó con ambiente colonial
      nU4s32AUq8aiqaw5sIZv: [
        "https://a0.muscache.com/im/pictures/1b769044-db51-4b16-9c3d-db2238632042.jpg?im_w=960&im_format=avif",
        "https://a0.muscache.com/im/pictures/836866fd-2bef-490c-a144-9b43c3ec35de.jpg?im_w=1200&im_format=avif",
        "https://a0.muscache.com/im/pictures/519d4788-7686-4669-94a7-35381b2078b8.jpg?im_w=1200&im_format=avif",
        "https://a0.muscache.com/im/pictures/e06b6c22-bca4-49e1-917d-d65262acb938.jpg?im_w=720&im_format=avif",
      ],

      //Titulo: Casa campestre en Rionegro
      vNUQZ6SknlwgpjAl9bMK: [
        "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTExNzQ1ODg5MzkxMTM1MTg5Nw%3D%3D/original/cc56d797-0388-4122-aea4-211149ec4ae3.jpeg?im_w=1200&im_format=avif",
        "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTExNzQ1ODg5MzkxMTM1MTg5Nw%3D%3D/original/79c267ae-4828-4d8f-8dcc-b9f8c85bdb94.jpeg?im_w=1200&im_format=avif",
        "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTExNzQ1ODg5MzkxMTM1MTg5Nw%3D%3D/original/026d8850-ee99-4296-bcc3-936067fc384f.jpeg?im_w=720&im_format=avif",
        "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTExNzQ1ODg5MzkxMTM1MTg5Nw%3D%3D/original/326264c6-8e40-4530-84ac-1b8e7bd580c3.jpeg?im_w=720&im_format=avif",
      ],
    };

    const updateImages = async () => {
      try {
        for (const [idPropiedad, nuevasImagenes] of Object.entries(
          updatedImagesProperties
        )) {
          const propertyRef = doc(db, "propiedades", idPropiedad);
          await updateDoc(propertyRef, { FotosPropiedad: nuevasImagenes });
          console.log(
            `imagenes de la propiedad: "${idPropiedad}" actualizadas correctamente.`
          );
        }
        setStatus("imagenes actualizadas correctamente.");
      } catch (error) {
        console.error("Error actualizando imagenes:", error);
        setStatus("Error al actualizar imagenes.");
      }
    };

    updateImages();
  }, []);

  return (
    <div>
      <h1>{status}</h1>
    </div>
  );
};

export default UpdatePropertyImages;
