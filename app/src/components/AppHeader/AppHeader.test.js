import { mount } from "@vue/test-utils";
import AppHeader from "./AppHeader.vue";

describe("test AppHeader", () => {
  it("test title", () => {
    const wrapper = mount(AppHeader, {
      // mount our component into a variable "wrapper"
      propsData: {
        title: "Hotels"
      }
    });
    expect(wrapper.html().includes("Hotels")).toBe(true);
  });

  it("test class", () => {
    const wrapper = mount(AppHeader, {
      propsData: {
        title: "Hotels"
      }
    });
    expect(wrapper.classes("navbar")).toBe(true);
  });
});
