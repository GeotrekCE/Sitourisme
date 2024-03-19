'use strict';

import * as path from 'path';
import { Request, Response } from 'express';
import EntityServer from './library/modules/server/models/entity.server.model'; // Update the path accordingly
import EventSchema from './modules/events/server/models/event.schema'; // Update the path accordingly
import genericServerController from './library/modules/server/controllers/generic.server.controller'; // Update the path accordingly

const eventsApi: string = 'touristicevent';
const moduleName: string = 'events';

let entityServer: EntityServer | null = null;
let entityModel: any = null; // Assuming entityModel type

const cgt: string = 'CGT events';

export const init = (): void => {
    entityServer = new EntityServer('Event', EventSchema);
    entityModel = entityServer.getModel();
};

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!entityModel) {
        throw new Error('Entity model not initialized.');
    }

    genericServerController.init(entityModel, eventsApi, moduleName);
    await genericServerController.list(req, res);
};

export const importData = (req: Request, res: Response): void => {
    if (!entityServer || !entityModel) {
        throw new Error('Entity server or model not initialized.');
    }

    console.log('controller events import > entity model = ', entityServer.entity);
    genericServerController.init(entityModel, eventsApi, moduleName, entityServer, cgt);
    genericServerController.import(req, res);
};