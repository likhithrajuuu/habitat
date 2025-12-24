import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";

test("renders the app shell", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(screen.getAllByText(/habitat/i).length).toBeGreaterThan(0);
});
