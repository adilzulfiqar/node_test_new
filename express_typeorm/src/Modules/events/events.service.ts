import { Repository } from "typeorm";
import { Event } from "./entities/event.entity";
import App from "../../app";
import { Workshop } from "./entities/workshop.entity";

export class EventsService {
  private eventRepository: Repository<Event>;
  private workshopRepository: Repository<Workshop>;

  constructor(app: App) {
    this.eventRepository = app.getDataSource().getRepository(Event);
    this.workshopRepository = app.getDataSource().getRepository(Workshop);
  }

  async getWarmupEvents() {
    return await this.eventRepository.find();
  }

  async getEventsWithWorkshops() {
    return await this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.workshops", "workshop")
      .getMany();
  }

  async getFutureEventWithWorkshops() {
    const currentDate = new Date();

    const futureEventIds = (
      await this.workshopRepository
        .createQueryBuilder("workshop")
        .select("workshop.eventId")
        .groupBy("workshop.eventId")
        .addSelect("MIN(workshop.start)", "min_start")
        .having("min_start > :currentDate", {
          currentDate: currentDate.toISOString(),
        })
        .getRawMany()
    ).map((e) => e.eventId);

    if (futureEventIds.length === 0) {
      return [];
    }

    return await this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.workshops", "workshop")
      .whereInIds(futureEventIds)
      .getMany();
  }
}
