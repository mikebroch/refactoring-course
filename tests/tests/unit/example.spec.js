import moment from "moment";
import Vuex from "vuex";
import Buefy from "buefy";
import PortalVue from "portal-vue";

import cars from "@/store/cars";

import { shallowMount, createLocalVue, mount } from "@vue/test-utils";
import { AppHeader } from "@/components/AppHeader";

import App from "@/App.vue";
import data from "@/data";
const { cars: carsItems, speedItems, runItems } = data;

/* mainApp */
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);
localVue.use(PortalVue);

const store = new Vuex.Store({
  modules: {
    cars: {
      ...cars,
      ...{
        cars: carsItems,
        speedItems,
        runItems
      }
    }
  }
});

describe("test App", () => {
  it("app works", () => {
    const wrapper = shallowMount(App, {
      localVue,
      store
    });
    const header = wrapper.find(AppHeader);
    expect(header.attributes().date).toBe(moment().format("YYYY-MM-DD"));
    expect(header.attributes().carName).toEqual(undefined);
  });
});

/* AppHeader */

const today = moment().format("YYYY-MM-DD");

const headerFactory = (propsData = {}) => {
  const props = {
    title: "Мой автопарк",
    carName: "Lada Largus",
    date: today
  };
  return mount(AppHeader, {
    propsData: {
      ...props,
      ...propsData
    }
  });
};

describe("test AppHeader", () => {
  it("test props", () => {
    const wrapper = headerFactory();
    expect(wrapper.html().includes("Мой автопарк")).toBe(true);
    expect(wrapper.html().includes("Машина: Lada Largus")).toBe(true);
    expect(wrapper.html().includes(today)).toBe(true);
    expect(wrapper.classes("has-background-light")).toBe(true);
  });

  it("test emit events", () => {
    const wrapper = headerFactory();
    wrapper.vm.nextDay();

    const nextDay = moment(today)
      .add(1, "days")
      .format("YYYY-MM-DD");
    let event = wrapper.emitted("change-date");
    expect(event).toBeTruthy();
    expect(event.length).toBe(1);
    expect(event[0]).toEqual([nextDay]);

    const prevDay = moment(today)
      .add(-1, "days")
      .format("YYYY-MM-DD");
    wrapper.vm.prevDay();
    event = wrapper.emitted("change-date");
    expect(event.length).toBe(2);
    expect(event[1]).toEqual([prevDay]);
  });
});

/* ToggleCarBookingButton */
import Button from "@/components/ToggleCarBookingButton/ToggleCarBookingButton.vue";

const buttonFactory = (propsData = {}) => {
  const props = {
    carId: 100,
    isAllowedBooking: true
  };
  return shallowMount(Button, {
    propsData: {
      ...props,
      ...propsData
    },
    stubs: {
      portal: true
    }
  });
};

describe("test ToggleCarBookingButton", () => {
  it("test required props", () => {
    const wrapper = buttonFactory();
    expect(wrapper.find("div.full-width").exists()).toBe(true);
    const link = wrapper.find("div.full-width > a");
    expect(link.exists()).toBe(true);
    expect(link.classes("car-booking-toggle-button")).toBe(true);
  });

  it("test isAllowedBooking property", () => {
    const wrapper = buttonFactory();
    const link = wrapper.find("div.full-width > a");

    expect(link.exists()).toBe(true);
    expect(link.classes("has-text-success")).toBe(true);
    expect(link.text()).toContain("Забронировать");

    wrapper.setProps({ isAllowedBooking: false });
    expect(link.classes("has-text-danger")).toBe(true);
    expect(link.text()).toContain("Отказаться");
  });

  it("test linkText computed property", () => {
    const localThis = { isAllowedBooking: true };
    const fn = Button.computed.linkText;

    expect(fn.call(localThis)).toBe("Забронировать");

    localThis.isAllowedBooking = false;
    expect(fn.call(localThis)).toBe("Отказаться");
  });
});

/* CarsFilter */

import CarsFilter from "@/components/CarsFilter/CarsFilter.vue";
import { BaseSelect } from "@/components/BaseSelect";

describe("test CarsFilter", () => {
  it("test html CarsFilter", () => {
    const wrapper = mount(CarsFilter, {
      stubs: {
        BaseSelect: true
      }
    });

    expect(wrapper.find("h2").text()).toContain("Фильтр");
    expect(wrapper.findAll("label").length).toBe(2);
    expect(wrapper.findAll(BaseSelect).length).toBe(2);
    expect(
      wrapper
        .findAll("label")
        .at(0)
        .text()
    ).toBe("Max скорость, км/ч");
    expect(
      wrapper
        .findAll("label")
        .at(1)
        .text()
    ).toBe("Пробег, тыс. км.");
  });

  it("test methods", () => {
    const events = {};
    const $emit = (event, ...args) => {
      events[event] = [...args];
    };
    const localThis = { speedValue: 0, runValue: 0, $emit };

    CarsFilter.methods.onChangeMaxSpeed.call(localThis, 2);
    expect(events["change-speed"]).toEqual([2]);

    CarsFilter.methods.onChangeCurrentRun.call(localThis, 2);
    expect(events["change-run"]).toEqual([2]);

    CarsFilter.methods.onResetFilter.call(localThis);
    expect(events["reset-filter"]).toEqual([]);
  });
});

/* CarCard */
import CarCard from "@/components/CarCard/CarCard.vue";
import { CarCardList } from "../../src/components/CarCardList";

//Vue.use(PortalVue);

const cardFactory = (propsData = {}) => {
  const props = {
    carId: 100,
    title: "BMW X5",
    description: "Super Car!",
    maxSpeed: 250,
    currentRun: 20
  };
  return mount(CarCard, {
    propsData: {
      ...props,
      ...propsData
    }
  });
};

describe("test CarCard", () => {
  it("test required props", () => {
    const wrapper = cardFactory();
    expect(
      wrapper
        .find(".content > p")
        .text()
        .includes("Super Car!")
    ).toBe(true);
    expect(
      wrapper
        .find(".media-content > p")
        .text()
        .includes("BMW X5")
    ).toBe(true);
    expect(wrapper.find("li:first-of-type").html()).toContain(
      "<strong>Max скорость: </strong>250 км/ч"
    );
    expect(wrapper.find("li:nth-of-type(2)").html()).toContain(
      "<strong>Пробег: </strong>20 тыс. км."
    );
    expect(wrapper.find("div.card").classes("active")).toBe(false);
  });

  it("test isActive property", () => {
    const wrapper = cardFactory({ isBooked: true });

    expect(wrapper.find("div.card").classes("active")).toBe(true);

    const link = wrapper.find("a.car-booking-toggle-button");
    expect(link.exists()).toBe(true);
    expect(link.classes("has-text-danger")).toBe(true);
    expect(link.text()).toContain("Отказаться");

    wrapper.setProps({ isBooked: false });
    expect(link.classes("has-text-success")).toBe(true);
    expect(link.text()).toContain("Забронировать");
  });
});

/* CarCardList */
describe("test CarCardList", () => {
  it("test empty cars", () => {
    const cars = [];
    const wrapper = shallowMount(CarCardList, {
      propsData: {
        cars
      }
    });

    expect(wrapper.find(".columns").exists()).toBe(true);
    expect(wrapper.find(".is-full").exists()).toBe(true);
    expect(wrapper.find("h2").exists()).toBe(true);
    expect(wrapper.html().includes("У вас пока нет машин.")).toBe(true);
  });

  it("test custom empty message", () => {
    const wrapper = shallowMount(CarCardList, {
      propsData: {
        cars: [],
        emptyText: "Нет записей..."
      }
    });

    expect(wrapper.find("h2").exists()).toBe(true);
    expect(wrapper.html().includes("Нет записей...")).toBe(true);
  });

  it("test cars count", () => {
    const cars = [
      { id: 1, title: "11", description: "11", maxSpeed: 50, currentRun: 10 },
      { id: 1, title: "11", description: "11", maxSpeed: 50, currentRun: 10 }
    ];

    const wrapper = mount(CarCardList, {
      propsData: {
        cars,
        emptyText: "Нет записей..."
      },
      stubs: {
        CarCard: true
      }
    });

    expect(wrapper.findAll(CarCard).length).toBe(2);
  });
});

/* BaseSelect */

const items = [
  { id: 1, name: "1" },
  { id: 2, name: "2" }
];

const selectFactory = (propsData = {}) => {
  const props = {
    items,
    value: 1
  };
  return mount(BaseSelect, {
    propsData: {
      ...props,
      ...propsData
    }
  });
};

describe("test BaseSelect", () => {
  it("test html", () => {
    const wrapper = selectFactory();
    const options = wrapper.findAll("option");
    expect(options.length).toBe(2);
    expect(options.at(0).attributes().label).toEqual("1");
    expect(options.at(0).attributes().value).toEqual("1");
    expect(options.at(1).attributes().label).toEqual("2");
    expect(options.at(1).attributes().value).toEqual("2");
  });

  it("test withEmpty property", () => {
    const wrapper = selectFactory({ withEmpty: true });
    const options = wrapper.findAll("option");
    expect(options.length).toBe(3);
    expect(options.at(0).attributes().label).toBe("");
    expect(options.at(0).attributes().value).toBe("0");
  });
});
