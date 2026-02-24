import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app brand", () => {
  render(<App />);
  const heading = screen.getByRole("heading", { name: /Welcome Back/i });
  expect(heading).toBeInTheDocument();
});
