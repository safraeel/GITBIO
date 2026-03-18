import { Router } from 'express';
import {
  cloneTemplate,
  createTemplate,
  createTemplateVersion,
  deleteTemplate,
  deployTemplate,
  getTemplateById,
  listTemplateVersions,
  listTemplates,
  restoreTemplateVersion,
  updateTemplate,
} from '../controllers/template.controller';

const router = Router();

router.get('/', listTemplates);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/:id/clone', cloneTemplate);
router.post('/:id/deploy', deployTemplate);
router.get('/:id/versions', listTemplateVersions);
router.post('/:id/versions', createTemplateVersion);
router.post('/:id/versions/:versionId/restore', restoreTemplateVersion);

export default router;
