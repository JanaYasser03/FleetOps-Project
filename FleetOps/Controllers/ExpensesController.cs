using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class ExpensesController : Controller
{
    public IActionResult Index() => View();
}
