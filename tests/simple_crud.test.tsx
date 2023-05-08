import * as React from "react";
import { render } from "@testing-library/react";

import "jest-canvas-mock";

import { SignalBoundary, useSignal } from "../src";
import { act } from "react-dom/test-utils";

type Person = {
  id: number;
  name: string;
};

const data: Person[] = [
  {
    id: 1,
    name: "Mike",
  },
  {
    id: 2,
    name: "John",
  },
  {
    id: 2,
    name: "Jim",
  },
];

const PersonList = SignalBoundary(() => {
  const dataSignal = useSignal(data);

  return (
    <>
      {dataSignal.map((person, index) => (
        <PersonLine person={person} key={index} />
      ))}
      <div onClick={() => dataSignal.push({ id: 3, name: "Dux" })}>Add Person</div>
    </>
  );
});

type PersonLineProps = {
  person: Person;
};

const PersonLine = SignalBoundary(({ person }: PersonLineProps) => {
  return <div>{person.name}</div>;
});

describe("Renders a list of elements", () => {
  it("renders an array of elements", async () => {
    const result = render(<PersonList />);

    expect(await result.findByText("Mike")).toBeDefined();
    expect(await result.findByText("John")).toBeDefined();
    expect(await result.findByText("Jim")).toBeDefined();
  });

  it("adds an element to the existing list and rerenders", async () => {
    const result = render(<PersonList />);

    const addPerson = await result.findByText("Add Person");
    await act(() => addPerson.click());

    expect(await result.findByText("Dux")).toBeDefined();
  });
});
