using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class CaseAssociate
    {
        public int CaseAssociateId { get; set; }
        public int PersonId { get; set; }
        public int CaseAssociateRoleId { get; set; }
        public int AssociatedStatusId { get; set; }
        public virtual CaseAssociateRole CaseAssociateRole { get; set; } = null!;
        public virtual AssociatedStatus AssociatedStatus { get; set; } = null!;
    }
}
