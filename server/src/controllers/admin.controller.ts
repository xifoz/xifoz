import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { ContactStatus } from '@prisma/client';
import type { ApiResponse } from '../types/index.js';
import * as adminRepository from '../repositories/admin.repository.js';
import { updateSettingsSchema } from '../validators/admin.validator.js';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [totalContacts, openRequests, closedRequests, administrators, recentContacts, recentAuditLogs] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({
        where: {
          status: { in: [ContactStatus.NEW, ContactStatus.IN_PROGRESS] },
        },
      }),
      prisma.contactSubmission.count({
        where: {
          status: { in: [ContactStatus.RESOLVED, ContactStatus.ARCHIVED, ContactStatus.SPAM] },
        },
      }),
      prisma.admin.count({
        where: { deletedAt: null },
      }),
      prisma.contactSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const response: ApiResponse<{
      metrics: {
        totalContacts: number;
        openRequests: number;
        closedRequests: number;
        administrators: number;
      };
      recentContacts: typeof recentContacts;
      recentAuditLogs: typeof recentAuditLogs;
    }> = {
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        metrics: {
          totalContacts,
          openRequests,
          closedRequests,
          administrators,
        },
        recentContacts,
        recentAuditLogs,
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawPage = parseInt(req.query['page'] as string || '1', 10);
    const rawLimit = parseInt(req.query['limit'] as string || '10', 10);
    const search = (req.query['search'] as string || '').trim();
    const status = (req.query['status'] as string || 'ALL').toUpperCase();

    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(100, rawLimit);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { service: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'ALL') {
      if (status === 'OPEN') {
        whereClause.status = { in: [ContactStatus.NEW, ContactStatus.IN_PROGRESS] };
      } else if (status === 'CLOSED') {
        whereClause.status = { in: [ContactStatus.RESOLVED, ContactStatus.ARCHIVED, ContactStatus.SPAM] };
      } else {
        whereClause.status = status;
      }
    }

    const [items, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactSubmission.count({
        where: whereClause,
      }),
    ]);

    const response: ApiResponse<{
      items: typeof items;
      total: number;
      page: number;
      limit: number;
    }> = {
      success: true,
      message: 'Contacts retrieved successfully',
      data: {
        items,
        total,
        page,
        limit,
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateContactStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: 'Contact ID is required' });
      return;
    }

    if (!status || !Object.values(ContactStatus).includes(status as ContactStatus)) {
      res.status(400).json({ success: false, message: 'Invalid status value' });
      return;
    }

    const updated = await prisma.contactSubmission.update({
      where: { id: String(id) },
      data: { status: status as ContactStatus },
    });

    await prisma.auditLog.create({
      data: {
        event: 'CONTACT_UPDATED',
        actorName: req.user?.email || 'Admin',
        details: `Contact request status updated for ${updated.name} (Email: ${updated.email}) to ${status}`,
        ipAddress: req.ip || null,
        adminId: req.user?.adminId || null,
      },
    });

    const response: ApiResponse<typeof updated> = {
      success: true,
      message: 'Contact status updated successfully',
      data: updated,
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawPage = parseInt(req.query['page'] as string || '1', 10);
    const rawLimit = parseInt(req.query['limit'] as string || '10', 10);
    const search = (req.query['search'] as string || '').trim();

    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(100, rawLimit);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { actorName: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({
        where: whereClause,
      }),
    ]);

    const response: ApiResponse<{
      items: typeof items;
      total: number;
      page: number;
      limit: number;
    }> = {
      success: true,
      message: 'Audit logs retrieved successfully',
      data: {
        items,
        total,
        page,
        limit,
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getAdminUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query['page'] as string || '1', 10);
    const limit = parseInt(req.query['limit'] as string || '20', 10);
    const search = (req.query['search'] as string || '').trim();
    const sort = req.query['sort'] as string || 'createdAt';

    // Validate page & limit
    const parsedPage = isNaN(page) || page < 1 ? 1 : page;
    const parsedLimit = isNaN(limit) || limit < 1 ? 20 : Math.min(100, limit);

    // Validate sort value
    const allowedSort = ['createdAt', 'lastLoginAt', 'name'] as const;
    type AllowedSortType = typeof allowedSort[number];
    const parsedSort = allowedSort.includes(sort as AllowedSortType)
      ? (sort as AllowedSortType)
      : 'createdAt';

    const result = await adminRepository.findAdmins({
      page: parsedPage,
      limit: parsedLimit,
      search,
      sort: parsedSort,
    });

    const totalPages = Math.ceil(result.total / parsedLimit) || 1;

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: result.total,
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSystemSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await prisma.systemSetting.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        portalTitle: 'XIFOZ Admin Portal',
        rateLimit: 60,
        sessionTimeout: 7,
        notificationsEnabled: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'System settings retrieved successfully',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSystemSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'general');
        if (!errors[key]) errors[key] = [];
        errors[key]!.push(issue.message);
      }
      res.status(422).json({
        success: false,
        message: 'Validation failed. Please correct the errors and try again.',
        errors,
      });
      return;
    }

    const updated = await prisma.systemSetting.update({
      where: { id: 'default' },
      data: {
        portalTitle: parsed.data.portalTitle,
        rateLimit: parsed.data.rateLimit,
        sessionTimeout: parsed.data.sessionTimeout,
        notificationsEnabled: parsed.data.notificationsEnabled,
      },
    });

    await prisma.auditLog.create({
      data: {
        event: 'SETTINGS_CHANGED',
        actorName: req.user?.email || 'Admin',
        details: `System settings updated: Title="${updated.portalTitle}", Rate Limit=${updated.rateLimit}, Session Timeout=${updated.sessionTimeout} days, Notifications=${updated.notificationsEnabled}`,
        ipAddress: req.ip || null,
        adminId: req.user?.adminId || null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
