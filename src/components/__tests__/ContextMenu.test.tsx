import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContextMenu from "../ui/ContextMenu";

describe("ContextMenu", () => {
    const mockOnClose = vi.fn();
    const mockItems = [
        { label: "Edit", onClick: vi.fn() },
        { label: "Delete", onClick: vi.fn(), danger: true },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders menu items", () => {
        render(
            <ContextMenu x={100} y={100} items={mockItems} onClose={mockOnClose} />
        );

        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("calls onClick when menu item is clicked", () => {
        render(
            <ContextMenu x={100} y={100} items={mockItems} onClose={mockOnClose} />
        );

        fireEvent.click(screen.getByText("Edit"));

        expect(mockItems[0].onClick).toHaveBeenCalled();
    });

    it("calls onClose when menu item is clicked", () => {
        render(
            <ContextMenu x={100} y={100} items={mockItems} onClose={mockOnClose} />
        );

        fireEvent.click(screen.getByText("Edit"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("positions menu at specified coordinates", () => {
        render(
            <ContextMenu x={150} y={200} items={mockItems} onClose={mockOnClose} />
        );

        // ContextMenu uses Portal, so find by class in document
        const menu = document.querySelector(".context-menu");
        expect(menu).toHaveStyle({ left: "150px", top: "200px" });
    });

    it("applies danger style to danger items", () => {
        render(
            <ContextMenu x={100} y={100} items={mockItems} onClose={mockOnClose} />
        );

        const deleteItem = screen.getByText("Delete");
        expect(deleteItem).toHaveClass("text-danger");
    });

    it("closes menu on outside click", () => {
        render(
            <ContextMenu x={100} y={100} items={mockItems} onClose={mockOnClose} />
        );

        // Click the overlay
        const overlay = document.querySelector(".context-menu-overlay");
        if (overlay) {
            fireEvent.click(overlay);
        }

        expect(mockOnClose).toHaveBeenCalled();
    });
});
