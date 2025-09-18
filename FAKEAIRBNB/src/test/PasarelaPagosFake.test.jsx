
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";


import PasarelaPagos from "../components/PasarelaPagosFake/PasarelaPagosFake";

describe("PasarelaPagos", () => {
  let onClose, onConfirm, user;
  beforeEach(() => {
    onClose = vi.fn();
    onConfirm = vi.fn();
    user = userEvent.setup();
  });

  const setup = () =>
    render(<PasarelaPagos onClose={onClose} onConfirm={onConfirm} />);

  it(" Renderiza el modal con el título 'Pagos Seguros' y role='dialog'", () => {
    setup();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/pagos seguros/i)).toBeInTheDocument();
  });

  it(" Renderiza todos los campos de la forma con sus placeholders", () => {
    setup();
    expect(
      screen.getByPlaceholderText(/nombre del titular/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/número de tarjeta/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/fecha de expiración/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/cvc/i)).toBeInTheDocument();
  });

  it(" Permite escribir en los inputs (no controlados) y retiene el valor tipeado", async () => {
    setup();
    const nombre = screen.getByPlaceholderText(/nombre del titular/i);
    const numero = screen.getByPlaceholderText(/número de tarjeta/i);
    const fecha = screen.getByPlaceholderText(/fecha de expiración/i);
    const cvc = screen.getByPlaceholderText(/cvc/i);

    await user.type(nombre, "Ada Lovelace");
    await user.type(numero, "4111111111111111");
    await user.type(fecha, "12/28");
    await user.type(cvc, "123");

    expect(nombre).toHaveValue("Ada Lovelace");
    expect(numero).toHaveValue("4111111111111111");
    expect(fecha).toHaveValue("12/28");
    expect(cvc).toHaveValue("123");
  });

  it(" El botón 'Cancelar Compra' llama a onClose exactamente una vez", async () => {
    setup();
    const cancelar = screen.getByRole("button", { name: /cancelar compra/i });
    await user.click(cancelar);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it(" El botón 'Confirmar Pago' llama a onConfirm exactamente una vez", async () => {
    setup();
    const confirmar = screen.getByRole("button", { name: /confirmar pago/i });
    await user.click(confirmar);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it(" Ambos botones están presentes y son elementos 'button'", () => {
    setup();
    const cancelar = screen.getByRole("button", { name: /cancelar compra/i });
    const confirmar = screen.getByRole("button", { name: /confirmar pago/i });
    expect(cancelar.tagName.toLowerCase()).toBe("button");
    expect(confirmar.tagName.toLowerCase()).toBe("button");
  });

  it(" Hacer click en el contenedor del diálogo no dispara onClose ni onConfirm", async () => {
    setup();
    const dialog = screen.getByRole("dialog");
    await user.click(dialog); 
    expect(onClose).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it(" Presionar Enter dentro del CVC no dispara onConfirm (no hay submit de form)", async () => {
    setup();
    const cvc = screen.getByPlaceholderText(/cvc/i);
    await user.click(cvc);
    await user.keyboard("{Enter}");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it(" El contenedor con role='dialog' expone tabindex='-1' (navegación de foco accesible)", () => {
    setup();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("tabindex", "-1");
  });

  it(" Presionar Escape no cierra el modal (no hay handler) y no llama onClose", async () => {
    setup();
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
   
    expect(screen.getByText(/pagos seguros/i)).toBeInTheDocument();
  });
});
