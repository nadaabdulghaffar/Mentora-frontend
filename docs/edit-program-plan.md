# Edit Program/Application Implementation Plan

**Created:** May 30, 2026  
**Status:** Phase 0 - Documentation & Backend Audit Complete  
**Priority:** High  
**Scope:** Edit Programs for Mentors on My Applications Page

---

## PHASE 0 - Backend Audit Results

### 1. Update Endpoint Analysis

#### Endpoint Details
```
Route:       /api/ProgramMentor/{programId}/update
Method:      PATCH
Authorization: Requires Mentor role
DTO:         UpdateProgramDto
```

#### Request Contract

**UpdateProgramDto** - All fields are optional (supports partial updates):
```csharp
public class UpdateProgramDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Availability { get; set; }
    public string? Duration { get; set; }
    public EducationStatus? EducationLevel { get; set; }
    public CurrentLevel? TargetLevel { get; set; }
    public string? ProgramImageUrl { get; set; }
    public ProgramPostStatus? Status { get; set; }
    public DateTime? Deadline { get; set; }
    public int? Capacity { get; set; }
    public int? DomainId { get; set; }
    public int? SubDomainId { get; set; }
    public int? RoadmapId { get; set; }
    public List<TechnologyRequirementDto> Technologies { get; set; }
    public List<ProgramQuestionDto>? Questions { get; set; }
}
```

#### Editable Fields
✅ **Fully Supported for Editing:**
- Title
- Description
- Availability
- Duration
- EducationLevel
- TargetLevel
- Deadline
- ProgramImageUrl
- Capacity
- Technologies (MentorshipRequirements)
- Status (Draft/Published)
- RoadmapId
- DomainId
- SubDomainId

❌ **NOT Editable (Backend Ignores):**
- Questions (field exists in DTO but not updated in code)
- CreatedAt, MentorProfileId
- All relation navigation properties

#### Validation Rules
```
Title Update:        Trimmed, no length validation
Description Update:  Trimmed, no length validation
DomainId Update:     Validated against current domain/subdomain relation
SubDomainId Update:  Validated against current domain/subdomain relation
RoadmapId Update:    Validated - must belong to mentee, must exist
Status Update:       When changing to Published:
                    - Description required and not blank
                    - Duration required and not blank
                    - DomainId != 0
                    - SubDomainId != 0
                    - At least 1 MentorshipRequirement (technology) required
Image Upload:        Via separate /File/upload-program-image endpoint
Deadline:            DateTime format, can be any date
Capacity:            Number, no range validation in update (but 1-1000 in create)
```

#### Domain/Subdomain Restrictions
✅ **CRITICAL FINDING:** Backend DOES allow updating DomainId and SubDomainId!
- Both fields can be modified in the UpdateProgramDto
- Backend code: `if (dto.DomainId != null) program.DomainId = dto.DomainId.Value;`
- **Frontend Decision Required:** Should mentors be allowed to change domains?

#### Response Contract
```csharp
public class ProgramResponseDto
{
    public int ProgramId { get; set; }
    public string Title { get; set; }
    public DateTime Deadline { get; set; }
    public string ProgramImageUrl { get; set; }
    public string Description { get; set; }
    public string Availability { get; set; }
    public string Duration { get; set; }
    public string EducationLevel { get; set; }
    public string TargetLevel { get; set; }
    public int Capacity { get; set; }
    public string DomainName { get; set; }
    public string SubDomainName { get; set; }
    public int? RoadmapId { get; set; }
    public List<TechnologyRequirementDto> Technologies { get; set; }
    public List<ProgramQuestionDto> Questions { get; set; }
}
```

---

### 2. Delete Endpoint Analysis

#### Endpoint Details
```
Route:       /api/ProgramMentor/{programId}
Method:      DELETE
Authorization: Requires Mentor role
Delete Type: HARD DELETE (data is permanently removed)
```

#### Implementation Details
```csharp
public async Task<ApiResponse<bool>> DeleteProgramAsync(int programId, Guid mentorProfileId)
{
    // 1. Find program by ID
    var program = await _unitOfWork.Programs.GetByIdAsync(programId);
    
    // 2. Authorization check - must own the program
    if (program.MentorProfileId != mentorProfileId)
        return error: "Program not found or unauthorized";
    
    // 3. Business rule check - prevent deletion if accepted mentees exist
    var acceptedCount = await _unitOfWork.MentorshipApplications
        .CountAsync(a => a.ProgramId == programId && a.Status == ApplicationStatus.Accepted);
    
    if (acceptedCount > 0)
        return error: "Cannot delete program with accepted mentees";
    
    // 4. Hard delete from database
    await _unitOfWork.Programs.DeleteAsync(program);
    await _unitOfWork.SaveChangesAsync();
    
    return success: true
}
```

#### Delete Restrictions
- ✅ Authorization: Checked (must be program owner)
- ✅ Business Logic: Cannot delete if mentees are accepted
- ⚠️ Cascade: Unknown - related entities (applications, questions) may or may not be deleted
- ❌ Soft Delete: Not supported - this is a hard delete

#### Risks
- **Data Loss Risk:** High - hard delete means no recovery possible
- **Application Loss:** All mentee applications will be deleted (need to verify cascade behavior)
- **Mentorship Loss:** Active mentorships may be affected (need to verify cascade behavior)

#### Response
```
Success: { success: true, message: "Program deleted successfully" }
Failure: { success: false, message: "Cannot delete program with accepted mentees" }
```

---

### 3. Unpublish Endpoint Analysis

#### Implementation
```
Unpublish does NOT have a dedicated endpoint.
Unpublish is handled via the UPDATE endpoint by changing Status to Draft.

Status Change Logic:
- Status.Draft (1) → Status.Published (2) = Publish (with validation)
- Status.Published (2) → Status.Draft (1) = Unpublish
```

#### How Unpublish Works
```csharp
// In UpdateProgramAsync, when Status is provided:
if (dto.Status.HasValue)
{
    if (dto.Status.Value == ProgramPostStatus.Published)
    {
        // Validation only on publish, not on unpublish
        if (string.IsNullOrWhiteSpace(program.Description) ||
            string.IsNullOrWhiteSpace(program.Duration) ||
            program.DomainId == 0 ||
            program.SubDomainId == 0 ||
            !program.MentorshipRequirements.Any())
        {
            return error: "Cannot publish! Please complete all required fields.";
        }
    }
    program.ProgramPostStatus = dto.Status.Value;
}
```

#### Unpublish Behavior
- ✅ No validation on unpublish
- ✅ Can unpublish at any time
- ✅ No data loss on unpublish
- ✅ Existing mentee applications preserved
- ❌ Frontend visibility may not update until refresh

---

## PHASE 1 - Frontend Impact Analysis

### Components Affected
1. **MyApplicationsPage.tsx** - Main page, entry point for edit
2. **ExtraProgramCard.tsx** - Card component with action menu
3. **CreateProgramModal.tsx** - Modal for create/edit (already supports edit mode)
4. **ProgramBasicsStep.tsx** - Step 1 of form
5. **ProgramRequirementsStep.tsx** - Step 2 of form
6. **ProgramQuestionsStep.tsx** - Step 3 of form

### Services Affected
1. **programService.ts** - Already has updateProgram() function
2. **authService.ts** - For auth context
3. **api.ts** - HTTP client (axios)

### Hooks/Utilities Affected
- React hooks (useState, useEffect)
- React Router (useNavigate)
- Formik form management
- Yup/Zod validation

### Types/DTOs Affected
- `CreateProgramFormData` - Maps form data to API input
- `CreateProgramApiInput` - API request shape
- `CreateProgramApiResponse` - API response shape

### Validation Schemas
- `createProgramSchema` - Already used for both create and edit

---

## PHASE 2 - Integration Risks & Decisions

### Risk 1: Domain/Subdomain Update Support
**Severity:** HIGH  
**Issue:** Backend allows updating Domain and SubDomain  
**Decision Required:** Should mentors be allowed to change these?

Options:
1. Allow changes (what backend supports)
2. Disable in UI but backend still accepts
3. Block in both UI and validate in backend

**Recommendation:** Disable in UI (read-only fields) but allow backend to accept them for future flexibility.

---

### Risk 2: Questions Not Updatable
**Severity:** MEDIUM  
**Issue:** UpdateProgramDto has `Questions` field but backend doesn't update it

```csharp
// Questions field exists in DTO but this code is missing:
if (dto.Questions != null)
{
    program.Questions = ... // NOT IMPLEMENTED
}
```

**Frontend Impact:** If user tries to edit questions, they won't save.

**Recommendation:** 
- Show questions as read-only in edit mode
- Display message: "Questions cannot be edited after creation"
- Prevent form submission from changing questions

---

### Risk 3: Delete vs Unpublish
**Severity:** MEDIUM  
**Issue:** Two different removal approaches with different risks

**Delete:**
- Hard delete (permanent)
- Blocked if mentees accepted
- May cascade to applications

**Unpublish:**
- Soft state change
- Reversible
- No data loss
- Keeps all applications

**Recommendation:** 
- Implement both options
- Show clear warning for delete
- Default to unpublish in UI
- Different confirmation dialogs

---

### Risk 4: Image Update Flow
**Severity:** LOW  
**Issue:** Image upload is a separate endpoint flow

**Current Flow:**
1. User selects image in form
2. Form submission triggers uploadProgramImage()
3. Backend returns image URL
4. URL is included in update payload

**Verification Needed:** Confirm image upload endpoint exists and works.

---

### Risk 5: Roadmap Validation
**Severity:** LOW  
**Issue:** RoadmapId update has custom validation

**Backend Validation:**
```csharp
var roadmap = await _unitOfWork.Roadmaps.GetByIdAsync(dto.RoadmapId.Value);
if (roadmap == null || roadmap.MentorProfileId != mentorProfileId)
    return error: "Selected roadmap not found for this mentor.";
```

**Frontend Impact:** Only mentor's own roadmaps can be selected. This is already handled in ProgramRequirementsStep where roadmaps are fetched from mentor's published list.

---

## PHASE 3 - Implementation Plan

### Step 1: Verify Current Modal Infrastructure
- ✅ CreateProgramModal already accepts `programId` and `initialValues` props
- ✅ Modal is configured for edit mode
- **Action:** Review implementation to ensure data loading works

### Step 2: Enhance Data Mapping
- **File:** MyApplicationsPage.tsx (line ~240 in openEditModal)
- **Action:** Map backend ProgramResponseDto to CreateProgramFormData
- **Issue:** Question fields not editable - show read-only warning
- **Mapping needed:**
  - domainId, subDomainId → pass but disable UI fields
  - technologies → map to TechnologyRequirementDto format
  - questions → load but show as read-only

### Step 3: Disable Restricted Fields
- **File:** ProgramBasicsStep.tsx
- **Action:** Accept `isEditMode` prop
- **When isEditMode = true:**
  - Domain selector → disabled
  - SubDomain selector → disabled
  - Show read-only badges

### Step 4: Implement Read-Only Questions
- **File:** ProgramQuestionsStep.tsx
- **Action:** Show questions in read-only mode during edit
- **Message:** "Questions cannot be edited after creation. To change questions, create a new program."
- **Option to remove questions:** Only allow removal, not modification of text

### Step 5: Connect Update API
- **File:** CreateProgramModal.tsx (line ~submit handler)
- **Action:** Call updateProgram() instead of createProgram() when programId exists
- **Payload:** Match UpdateProgramDto contract exactly
- **Handle image upload:** Reuse existing uploadProgramImage() flow

### Step 6: Add Unpublish Action
- **File:** MyApplicationsPage.tsx
- **Action:** Implement unpublish handler
- **Flow:**
  1. Call updateProgram(programId, { status: PROGRAM_POST_STATUS.DRAFT })
  2. Refresh programs list
  3. Show success toast

### Step 7: Add Delete Action
- **File:** MyApplicationsPage.tsx
- **Action:** Implement delete handler with confirmation
- **Confirmation Dialog:** Warn about data loss and accepted mentees check
- **Flow:**
  1. Show confirmation dialog
  2. Call DELETE /api/ProgramMentor/{programId}
  3. Handle error if mentees accepted
  4. Refresh programs list
  5. Show success/error toast

### Step 8: Connect Card Actions
- **File:** MyApplicationsPage.tsx
- **Action:** Wire up card menu handlers:
  - onViewApplicants → navigate to manage applicants
  - onEdit → openEditModal
  - onUnpublish → unpublish handler
  - (onDelete → delete handler if implemented)

### Step 9: Success Feedback
- **Show toast notifications for:**
  - Program updated successfully
  - Program published/unpublished
  - Program deleted successfully
  - Error messages with specific validation failures

### Step 10: List Refresh
- **Action:** After edit/unpublish/delete, refresh the programs list
- **Implementation:** 
  - Re-call getMyPublishedPrograms()
  - Update mentorApplications state
  - Smooth UI update without full page reload

---

## PHASE 4 - Expected Files to Change

### Create/Modify Files
1. **MyApplicationsPage.tsx**
   - Add unpublish handler
   - Add delete handler
   - Wire up card action callbacks
   - Add confirmation dialogs

2. **CreateProgramModal.tsx**
   - Pass isEditMode to form components
   - Call updateProgram when editing
   - Handle response appropriately

3. **ProgramBasicsStep.tsx**
   - Accept and handle isEditMode prop
   - Disable domain/subdomain fields in edit mode

4. **ProgramQuestionsStep.tsx**
   - Accept and handle isEditMode prop
   - Show questions in read-only mode
   - Prevent question modification

### Reference/Verify Files
1. **ExtraProgramCard.tsx** - Already has menu actions
2. **programService.ts** - Already has updateProgram function
3. **types/program.ts** - Verify all types are correct
4. **api.ts** - Verify axios configuration

---

## PHASE 5 - Architecture Decisions

### Reuse Strategy
- ✅ Reuse CreateProgramModal for both create and edit
- ✅ Reuse programService.updateProgram() function
- ✅ Reuse validation schema (createProgramSchema)
- ✅ Reuse form components (ProgramBasicsStep, ProgramRequirementsStep, etc.)
- ✅ Reuse ExtraProgramCard menu structure

### Data Loading
- Load program data via fetchProgramById() when edit modal opens
- Map backend fields to form structure
- Show loading state while fetching
- Handle errors gracefully

### State Management
- Use local component state for modal open/close
- Use local state for loading/error states
- Refresh parent list after successful update

### Image Handling
- Reuse existing uploadProgramImage() flow
- Support both existing image URLs and new uploads
- Show image preview during edit

---

## PHASE 6 - Domain/Subdomain Decision

### Critical Question: Editable or Read-Only?

**Backend Status:** Backend supports updating both fields

**Options:**

**Option A: Read-Only in UI**
- Pros: Prevents domain confusion, simpler UX
- Cons: May frustrate users if they need to change
- Implementation: Add `disabled` attribute to selectors

**Option B: Allow Changes**
- Pros: Maximum flexibility
- Cons: Could cause data inconsistency, requires careful validation
- Implementation: Enable selectors, validate against subdomain

**DECISION: Option A - Read-Only**
- Justification: Domain represents the core program specialization; changing it should require creating new program
- Implementation: Show fields as read-only with labels
- Message: "Domain cannot be changed. Create a new program if you need different domain."

---

## DTO Compatibility Summary

### CreateProgramRequestDto vs UpdateProgramDto

| Field | Create | Update | Notes |
|-------|--------|--------|-------|
| Title | ✅ Required | ✅ Optional | Both support |
| Description | ✅ Required | ✅ Optional | Both support |
| DomainId | ✅ Required | ✅ Optional | Backend allows update |
| SubDomainId | ✅ Required | ✅ Optional | Backend allows update |
| TargetLevel | ✅ Required | ✅ Optional | Both support |
| EducationLevel | ✅ Required | ✅ Optional | Both support |
| Capacity | ✅ Required | ✅ Optional | Both support |
| Duration | ✅ Required | ✅ Optional | Both support |
| Availability | ✅ Required | ✅ Optional | Both support |
| ProgramImageUrl | ❌ Optional | ✅ Optional | Both support |
| Deadline | ✅ Required | ✅ Optional | Both support |
| Status | ✅ Required | ✅ Optional | Both support |
| Technologies | ✅ Required | ✅ Optional | Both support (min 1 on publish) |
| RoadmapId | ❌ Optional | ✅ Optional | Update only |
| Questions | ❌ Optional | ⚠️ Ignored | Create only, not actually updated |

---

## Testing Checklist

- [ ] Edit menu item appears on card
- [ ] Edit modal opens with existing data
- [ ] Image displays correctly
- [ ] Domain field is disabled/read-only
- [ ] SubDomain field is disabled/read-only
- [ ] Technologies display and cannot be changed
- [ ] Questions display as read-only
- [ ] Form validation works (same as create)
- [ ] Update API call succeeds
- [ ] Success toast displays
- [ ] Programs list refreshes
- [ ] Old data no longer shown after edit
- [ ] Unpublish action works
- [ ] Unpublish changes status immediately
- [ ] Delete shows confirmation dialog
- [ ] Delete warns about data loss
- [ ] Delete fails gracefully if mentees accepted
- [ ] Error messages display correctly
- [ ] Loading states show/hide properly

---

## Known Issues & Limitations

1. **Questions Cannot Be Edited**
   - Backend doesn't update questions even if provided in DTO
   - Display as read-only in edit mode
   - Consider note: "To change questions, create a new program"

2. **Hard Delete Risk**
   - Delete is permanent with no recovery
   - Always show strong confirmation

3. **Domain/Subdomain Not Editable by Design**
   - Set as read-only to prevent accidental changes
   - User must create new program to change domain

4. **Image Upload**
   - Separate endpoint flow
   - Verify upload endpoint exists and works correctly

---

## Next Steps

1. ✅ Backend Audit: **COMPLETE**
2. ✅ Documentation: **COMPLETE**
3. ⏭️ **Phase Implementation:** Ready to begin
4. ⏭️ **Implementation Report:** To be created after coding

---

## Appendix: Backend Code References

### UpdateProgram Implementation
- File: `Mentora-backend/src/Core/Mentora.Application/Services/ProgramMentorService.cs`
- Lines: 342-447
- Method: `UpdateProgramAsync`

### DeleteProgram Implementation
- File: `Mentora-backend/src/Core/Mentora.Application/Services/ProgramMentorService.cs`
- Lines: 450-472
- Method: `DeleteProgramAsync`

### Controller Endpoints
- File: `Mentora-backend/src/Presentation/Mentora.API/Controllers/ProgramMentorController.cs`
- Update: Line 71 - `[HttpPatch("{programId}/update")]`
- Delete: Line 82 - `[HttpDelete("{programId}")]`

### DTOs
- UpdateProgramDto: `Mentora-backend/src/Core/Mentora.Application/DTOs/Programs/UpdateProgramDto.cs`
- CreateProgramRequestDto: `Mentora-backend/src/Core/Mentora.Application/DTOs/Programs/CreateProgramRequestDto.cs`

---

**Document Version:** 1.0  
**Last Updated:** May 30, 2026  
**Status:** Ready for Phase Implementation
