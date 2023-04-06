import { MenuItem } from "./entities/menu-item.entity";
import { Repository } from "typeorm";
import App from "../../app";

export class MenuItemsService {
  private menuItemRepository: Repository<MenuItem>;

  constructor(app: App) {
    this.menuItemRepository = app.getDataSource().getRepository(MenuItem);
  }

  async getMenuItems() {
    const allMenuItems = await this.menuItemRepository.find();

    function buildNestedMenu(parentId: number | null): any {
      return allMenuItems
        .filter((item) => item.parentId === parentId)
        .map((item) => {
          const children = buildNestedMenu(item.id);
          return { ...item, children };
        });
    }

    return buildNestedMenu(null);
  }
}
