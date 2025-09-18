
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "../pages/RegistroInicio/Modal";

describe("Modal", () => {
  let onClose, user;
  beforeEach(() => {
    onClose = vi.fn();
    user = userEvent.setup();
  });

  it(" Renderiza título principal, subtítulo y children cuando show=true", () => {
    render(
      <Modal show onClose={onClose}>
        <div>Contenido del modal</div>
      </Modal>
    );

    expect(screen.getByText(/Iniciar sesión o registrarse/i)).toBeInTheDocument();
    expect(screen.getByText(/te damos la bienvenida a fakeairbnb/i)).toBeInTheDocument();
    expect(screen.getByText(/contenido del modal/i)).toBeInTheDocument();
  });

  it(" Aplica clase 'd-block' cuando show=true", () => {
    const { container } = render(<Modal show onClose={onClose}>x</Modal>);
    const root = container.querySelector(".modal");
    expect(root).toHaveClass("d-block");
    expect(root).not.toHaveClass("d-none");
  });

  it(" Aplica clase 'd-none' cuando show=false (pero sigue en el DOM)", () => {
    const { container } = render(<Modal show={false} onClose={onClose}>x</Modal>);
    const root = container.querySelector(".modal");
    expect(root).toHaveClass("d-none");
    expect(root).not.toHaveClass("d-block");
   
    expect(screen.getByText("x")).toBeInTheDocument();
  });

  it(" Alternar de show=false a show=true cambia de 'd-none' a 'd-block'", () => {
    const { container, rerender } = render(<Modal show={false} onClose={onClose}>x</Modal>);
    const root1 = container.querySelector(".modal");
    expect(root1).toHaveClass("d-none");

    rerender(<Modal show onClose={onClose}>x</Modal>);
    const root2 = container.querySelector(".modal");
    expect(root2).toHaveClass("d-block");
    expect(root2).not.toHaveClass("d-none");
  });

  it(" El botón de cerrar dispara onClose una vez al hacer click", async () => {
    render(<Modal show onClose={onClose}>x</Modal>);
    const closeBtn = screen.getByRole("button", { name: "" }); 
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it(" El botón de cerrar tiene type='button' para evitar submits accidentales", () => {
    render(<Modal show onClose={onClose}>x</Modal>);
    
    const btn = screen.getByRole("button", { name: "" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveClass("btn-close");
  });

  it(" El root del modal tiene tabIndex='-1' (navegación de foco)", () => {
    const { container } = render(<Modal show onClose={onClose}>x</Modal>);
    const root = container.querySelector(".modal");
    
    expect(root).toHaveAttribute("tabindex", "-1");
  });

  it(" Click dentro de '.modal-content' no llama a onClose (no hay handler para backdrop)", async () => {
    const { container } = render(<Modal show onClose={onClose}>x</Modal>);
    const content = container.querySelector(".modal-content");
    await user.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it(" Presionar Escape no cierra el modal (no hay handler de teclado)", async () => {
    render(<Modal show onClose={onClose}>x</Modal>);
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
    
    expect(screen.getByText(/Iniciar sesión o registrarse/i)).toBeInTheDocument();
  });

  it(" Inserta correctamente múltiples children dentro de '.modal-body'", () => {
    const { container } = render(
      <Modal show onClose={onClose}>
        <p>child-1</p>
        <span>child-2</span>
      </Modal>
    );
    const body = container.querySelector(".modal-body");
    const withinBody = within(body);
    expect(withinBody.getByText("child-1")).toBeInTheDocument();
    expect(withinBody.getByText("child-2")).toBeInTheDocument();
  });
});
