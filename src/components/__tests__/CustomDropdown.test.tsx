import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CustomDropdown from "../CustomDropdown";

describe("CustomDropdown", () => {
    const mockOnChange = vi.fn();
    const options = [
        { value: "", label: "Select..." },
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with placeholder when no value selected", () => {
        render(
            <CustomDropdown
                value=""
                onChange={mockOnChange}
                options={[{ value: "opt1", label: "Option 1" }]} // Remove default option to allow placeholder
                placeholder="Select an option"
            />
        );

        expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("renders with selected value label", () => {
        render(
            <CustomDropdown value="opt1" onChange={mockOnChange} options={options} />
        );

        expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("opens dropdown menu on click", () => {
        render(
            <CustomDropdown value="" onChange={mockOnChange} options={options} />
        );

        const trigger = screen.getByRole("button");
        fireEvent.click(trigger);

        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("calls onChange when option is selected", () => {
        render(
            <CustomDropdown value="" onChange={mockOnChange} options={options} />
        );

        const trigger = screen.getByRole("button");
        fireEvent.click(trigger);

        fireEvent.click(screen.getByText("Option 1"));

        expect(mockOnChange).toHaveBeenCalledWith("opt1");
    });

    it("closes dropdown after selection", () => {
        render(
            <CustomDropdown value="" onChange={mockOnChange} options={options} />
        );

        const trigger = screen.getByRole("button");
        fireEvent.click(trigger);
        fireEvent.click(screen.getByText("Option 1"));

        // Dropdown should close, so Option 2 should not be visible
        expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
    });

    it("applies custom style", () => {
        render(
            <CustomDropdown
                value=""
                onChange={mockOnChange}
                options={options}
                style={{ width: "200px" }}
            />
        );

        const container = screen.getByRole("button").closest(".custom-dropdown");
        expect(container).toHaveStyle({ width: "200px" });
    });
});
