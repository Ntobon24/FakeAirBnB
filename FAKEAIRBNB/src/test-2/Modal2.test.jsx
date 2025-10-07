import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "../pages/RegistroInicio/Modal";

describe("Componente Modal: Formulario registro/inicio", () => {

    //Arrange
    let onClose;
    let user;
    beforeEach(() => {
        onClose = vi.fn();
        user = userEvent.setup();
    });

  it("debe renderizar correctamente el título, subtítulo y contenido cuando show=true", () => {

    //Arrange
    render(
        <Modal show onClose={onClose}>
        <div>Contenido del modal</div>
        </Modal>
    )

    //Assert

    //Equivale a: Should().BeInTheDocument() 
    expect(screen.getByText(/Iniciar sesión o registrarse/i)).toBeInTheDocument()
    expect(screen.getByText(/te damos la bienvenida a fakeairbnb/i)).toBeInTheDocument()
    expect(screen.getByText(/contenido del modal/i)).toBeInTheDocument()
    })

    it("aplica clase 'd-none' cuando show=false", () => {
  
        //Arrange
        const onClose = vi.fn()
        const { container } = render(<Modal show={false} onClose={onClose}>x</Modal>)
        
        //Act: Acceder a la etiqueta modal tiene la clase d-none
        const root = container.querySelector(".modal")
        
        //Assert

        //Equivale a: Should().HaveClass() y Should().NotHaveClass()
        expect(root).toHaveClass("d-none")
        expect(root).not.toHaveClass("d-block")
    })

    it("aplica clase 'd-none' cuando show=false (pero sigue en el DOM)", () => {
        
        // Arrange
        const { container } = render(<Modal show={false} onClose={onClose}>x</Modal>)

        // Act: Acceder a la etiqueta modal tiene la clase d-none
        const root = container.querySelector(".modal")

        // Assert

        //Equivale a: Should().HaveClass(), Should().NotHaveClass()
        expect(root).toHaveClass("d-none")
        expect(root).not.toHaveClass("d-block")

    })

    it("debe llamar a onClose una vez al hacer clic en el botón cerrar", async () => {

        //Arrange
        render(<Modal show onClose={onClose}>x</Modal>);

        //Act: interaccion usuarioclick cerrar modal
        const closeBtn = screen.getByRole("button", { name: "" });
        await user.click(closeBtn); 

        //Assert

        // Equivalete a: onClose.Should().BeCalledOnce()
        expect(onClose).toHaveBeenCalledTimes(1);
    });


});